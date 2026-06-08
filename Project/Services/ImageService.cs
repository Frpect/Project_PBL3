using Microsoft.Extensions.Options;
using Project.ApplicationLogic.DTOs;
using System.Net.Http.Json;

namespace Project.ApplicationLogic.Service
{
    public class ImageService : IImageService
    {
        private readonly HttpClient _httpClient;
        private readonly CloudinarySettings _settings;

        public ImageService(HttpClient httpClient, IOptions<CloudinarySettings> settings)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            var url = $"https://api.cloudinary.com/v1_1/{_settings.CloudName}/image/upload";

            using var content = new MultipartFormDataContent();
            
            // Thêm file vào form data
            var fileStream = file.OpenReadStream();
            var streamContent = new StreamContent(fileStream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
            content.Add(streamContent, "file", file.FileName);

            // Thêm upload preset
            content.Add(new StringContent(_settings.UploadPreset), "upload_preset");

            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Cloudinary upload failed: {error}");
            }

            var result = await response.Content.ReadFromJsonAsync<CloudinaryResponse>();
            return result?.SecureUrl ?? string.Empty;
        }

        private class CloudinaryResponse
        {
            [System.Text.Json.Serialization.JsonPropertyName("secure_url")]
            public string SecureUrl { get; set; } = string.Empty;
        }
    }
}
