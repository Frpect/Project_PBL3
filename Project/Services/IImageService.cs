namespace Project.ApplicationLogic.Service
{
    public interface IImageService
    {
        Task<string> UploadImageAsync(IFormFile file);
    }
}
