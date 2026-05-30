import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { getInventory, getInventoryLogs, adjustInventory, ApiInventoryItem, ApiInventoryLog } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Package, PackagePlus, PackageMinus, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

type TransactionType = 'stock-in' | 'stock-out' | 'adjustment';

export function InventoryPage() {
  const location = useLocation();
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transaction, setTransaction] = useState({
    variantId: '',
    type: 'stock-in' as TransactionType,
    quantity: 0,
    reason: '',
    notes: '',
  });
  const [allVariants, setAllVariants] = useState<ApiInventoryItem[]>([]);
  const [logs, setLogs] = useState<ApiInventoryLog[]>([]);
  const [variantSearch, setVariantSearch] = useState('');
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);

  useEffect(() => {
    getInventory().then(setAllVariants).catch(() => {});
    getInventoryLogs().then(setLogs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!allVariants.length) return;
    const state = location.state as { openDialog?: boolean; variantId?: string } | null;
    if (!state?.openDialog || !state.variantId) return;
    const item = allVariants.find(v => String(v.variantId) === state.variantId);
    if (item) {
      setTransaction(t => ({ ...t, variantId: state.variantId!, type: 'stock-in' }));
      setVariantSearch(`${item.productName} — ${item.size || ''}${item.color ? ` / ${item.color}` : ''}`);
    }
    setShowTransactionDialog(true);
  }, [allVariants, location.state]);

  const getStock = (v: { stock?: number; quantity?: number }) => v.stock ?? v.quantity ?? 0;

  const normalizeLogType = (type: string): 'stock-in' | 'stock-out' | 'adjustment' => {
    const t = (type ?? '').toLowerCase();
    if (t === 'import' || t === '1' || t.includes('nhập') || t === 'stock-in') return 'stock-in';
    if (t === 'export' || t === '2' || t.includes('xuất') || t === 'stock-out') return 'stock-out';
    return 'adjustment';
  };

  const filteredForSearch = variantSearch
    ? allVariants.filter(v =>
        (v.productName || '').toLowerCase().includes(variantSearch.toLowerCase()) ||
        (v.sku || '').toLowerCase().includes(variantSearch.toLowerCase())
      )
    : allVariants;

  const filteredVariants = allVariants.filter(v =>
    (v.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransaction = async () => {
    if (!transaction.variantId) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    if (transaction.quantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }
    if (!transaction.reason) {
      toast.error('Vui lòng nhập lý do');
      return;
    }
    try {
      await adjustInventory({ variantId: transaction.variantId, type: transaction.type, quantity: transaction.quantity, reason: transaction.reason, notes: transaction.notes });
      toast.success('Cập nhật kho thành công');
      setShowTransactionDialog(false);
      setTransaction({ variantId: '', type: 'stock-in', quantity: 0, reason: '', notes: '' });
      setVariantSearch('');
      getInventory().then(setAllVariants);
      getInventoryLogs().then(setLogs);
    } catch (e: any) { toast.error(e.message); }

  };

  const selectedVariant = allVariants.find(v => v.variantId === transaction.variantId) as (typeof allVariants[0] & { stock: number }) | undefined;

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Hết hàng', variant: 'destructive' as const };
    if (stock < 10) return { label: 'Sắp hết', variant: 'default' as const };
    return { label: 'Còn hàng', variant: 'default' as const };
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    switch (type) {
      case 'stock-in': return 'Nhập kho';
      case 'stock-out': return 'Xuất kho';
      case 'adjustment': return 'Điều chỉnh';
    }
  };

  const getTransactionBadge = (type: TransactionType) => {
    switch (type) {
      case 'stock-in': return <Badge className="bg-success text-white">Nhập kho</Badge>;
      case 'stock-out': return <Badge variant="destructive">Xuất kho</Badge>;
      case 'adjustment': return <Badge variant="outline">Điều chỉnh</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">Quản lý kho hàng</h1>
          <p className="text-text-secondary mt-2">Quản lý tồn kho và theo dõi nhập/xuất kho</p>
        </div>
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogTrigger asChild>
            <Button>
              <Package className="size-4 mr-2" />
              Thêm giao dịch kho
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm giao dịch kho</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="transType">
                  Loại giao dịch <span className="text-accent">*</span>
                </Label>
                <Select value={transaction.type} onValueChange={(value: TransactionType) => setTransaction({ ...transaction, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock-in">
                      <div className="flex items-center gap-2">
                        <PackagePlus className="size-4 text-success" />
                        Nhập kho
                      </div>
                    </SelectItem>
                    <SelectItem value="stock-out">
                      <div className="flex items-center gap-2">
                        <PackageMinus className="size-4 text-destructive" />
                        Xuất kho
                      </div>
                    </SelectItem>
                    <SelectItem value="adjustment">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4" />
                        Điều chỉnh kiểm kê
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transVariant">
                  Sản phẩm / Biến thể <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Gõ tên sản phẩm để tìm..."
                    value={variantSearch}
                    onChange={(e) => { setVariantSearch(e.target.value); setShowVariantDropdown(true); setTransaction({ ...transaction, variantId: '' }); }}
                    onFocus={() => setShowVariantDropdown(true)}
                    onBlur={() => setTimeout(() => setShowVariantDropdown(false), 200)}
                  />
                  {showVariantDropdown && (
                    <div className="absolute z-50 w-full bg-white border rounded-md shadow-lg max-h-52 overflow-y-auto mt-1">
                      {filteredForSearch.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-text-secondary">Không tìm thấy</div>
                      ) : filteredForSearch.map(v => (
                        <div
                          key={String(v.variantId)}
                          className="px-3 py-2 hover:bg-accent/10 cursor-pointer text-sm"
                          onMouseDown={() => {
                            setTransaction({ ...transaction, variantId: String(v.variantId) });
                            setVariantSearch(`${v.productName} — ${v.size || ''}${v.color ? ` / ${v.color}` : ''}`);
                            setShowVariantDropdown(false);
                          }}
                        >
                          <span className="font-medium">{v.productName}</span>{' '}
                          <span className="text-text-secondary">— {v.size || ''}{v.color ? ` / ${v.color}` : ''}</span>{' '}
                          <span className="text-xs text-text-secondary">(Tồn: {getStock(v)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedVariant && (
                <div className="p-4 bg-background-secondary rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">SKU:</span>
                      <p className="font-mono">{selectedVariant.sku}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Tồn kho hiện tại:</span>
                      <p className="text-lg">{getStock(selectedVariant)}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary">Trạng thái:</span>
                      <p>
                        <Badge variant={getStockStatus(getStock(selectedVariant)).variant}>
                          {getStockStatus(getStock(selectedVariant)).label}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="transQuantity">
                  {transaction.type === 'adjustment' ? 'Số lượng mới' : 'Số lượng'} <span className="text-accent">*</span>
                </Label>
                <Input
                  id="transQuantity"
                  type="number"
                  value={transaction.quantity}
                  onChange={(e) => setTransaction({ ...transaction, quantity: Number(e.target.value) })}
                  min="0"
                />
                {transaction.type === 'adjustment' && selectedVariant && (
                  <p className="text-sm text-text-secondary mt-1">
                    Chênh lệch: {transaction.quantity - getStock(selectedVariant) > 0 ? '+' : ''}
                    {transaction.quantity - getStock(selectedVariant)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="transReason">
                  Lý do <span className="text-accent">*</span>
                </Label>
                <Select value={transaction.reason} onValueChange={(value) => setTransaction({ ...transaction, reason: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    {transaction.type === 'stock-in' && (
                      <>
                        <SelectItem value="Nhập hàng từ nhà cung cấp">Nhập hàng từ nhà cung cấp</SelectItem>
                        <SelectItem value="Nhập hàng trả lại">Nhập hàng trả lại</SelectItem>
                        <SelectItem value="Nhập hàng điều chuyển">Nhập hàng điều chuyển</SelectItem>
                      </>
                    )}
                    {transaction.type === 'stock-out' && (
                      <>
                        <SelectItem value="Bán tại quầy">Bán tại quầy</SelectItem>
                        <SelectItem value="Xuất hàng online">Xuất hàng online</SelectItem>
                        <SelectItem value="Xuất hàng hư hỏng">Xuất hàng hư hỏng</SelectItem>
                        <SelectItem value="Xuất hàng khuyến mãi">Xuất hàng khuyến mãi</SelectItem>
                      </>
                    )}
                    {transaction.type === 'adjustment' && (
                      <>
                        <SelectItem value="Kiểm kê phát hiện hao hụt">Kiểm kê phát hiện hao hụt</SelectItem>
                        <SelectItem value="Kiểm kê phát hiện thừa">Kiểm kê phát hiện thừa</SelectItem>
                        <SelectItem value="Điều chỉnh sai số">Điều chỉnh sai số</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transNotes">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="transNotes"
                  value={transaction.notes}
                  onChange={(e) => setTransaction({ ...transaction, notes: e.target.value })}
                  placeholder="Thông tin bổ sung về giao dịch"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="button" onClick={handleTransaction}>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
          <TabsTrigger value="logs">Lịch sử giao dịch</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách tồn kho</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-text-secondary" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã SP</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVariants.map((variant) => {
                    const stock = getStock(variant);
                    const status = getStockStatus(stock);
                    return (
                      <TableRow key={variant.variantId}>
                        <TableCell className="font-mono text-sm">{variant.productId || '—'}</TableCell>
                        <TableCell>{variant.productName}</TableCell>
                        <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                        <TableCell>{variant.sizeName || variant.size}</TableCell>
                        <TableCell>{variant.colorName || variant.color}</TableCell>
                        <TableCell>
                          <span className="text-lg">{getStock(variant)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử giao dịch kho ({logs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày giờ</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Biến thể</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Nhân viên</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => (
                    <TableRow key={log.logId || idx}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{log.createdAt ? new Date(log.createdAt).toLocaleDateString('vi-VN') : '-'}</div>
                          <div className="text-text-secondary">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN') : ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTransactionBadge(normalizeLogType(log.type))}</TableCell>
                      <TableCell>{log.productName}</TableCell>
                      <TableCell className="font-mono text-xs">{log.variantLabel || log.sku || '—'}</TableCell>
                      <TableCell>
                        <span className={log.quantity > 0 ? 'text-success' : 'text-destructive'}>
                          {log.quantity > 0 ? '+' : ''}{log.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-text-secondary">
                          {log.previousStock != null && log.newStock != null
                            ? `${log.previousStock} → ${log.newStock}`
                            : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{log.reason || log.note || '—'}</div>
                          {(log.notes || log.note) && log.reason && (
                            <div className="text-text-secondary mt-1">{log.notes || log.note}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{log.staffName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
