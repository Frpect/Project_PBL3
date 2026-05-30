using System.Collections.Generic;

namespace Project.ApplicationLogic.DTOs
{
    public class SyncCartRequest
    {
        public int UserId { get; set; }
        public List<SyncCartItemDto> Items { get; set; } = new();
    }
}