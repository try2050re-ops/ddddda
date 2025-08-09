import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Phone, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: number;
  customer_name: string;
  mobile_number: number;
  line_type: number;
  charging_date: string | null;
  renewal_date: string | null;
  payment_status: string;
  monthly_price: number | null;
  renewal_status: string;
  created_at?: string;
  updated_at?: string;
}

interface CustomerTableProps {
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerTable = ({ onAddCustomer, onEditCustomer }: CustomerTableProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('cardinfo')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات العملاء",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('cardinfo')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCustomers(customers.filter(c => c.id !== id));
      toast({
        title: "تم بنجاح",
        description: "تم حذف العميل بنجاح",
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف العميل",
        variant: "destructive",
      });
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'paid' || status === 'دفع') {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">دفع</Badge>;
    }
    return <Badge variant="secondary">لم يدفع</Badge>;
  };

  const getRenewalStatusBadge = (status: string) => {
    if (status === 'done' || status === 'تم') {
      return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">تم التجديد</Badge>;
    }
    return <Badge variant="outline">لم يتم</Badge>;
  };

  const parseDateAssume2025 = (dateString: string | null): Date | null => {
    if (!dateString) return null;

    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const ymdSlash = /^\d{4}\/\d{2}\/\d{2}$/;
    const dmySlash = /^\d{2}\/\d{2}\/\d{4}$/;
    const dMon = /^(\d{1,2})-(\w{3})$/i; // e.g., 5-Aug

    if (iso.test(dateString)) return new Date(dateString + 'T00:00:00Z');
    if (ymdSlash.test(dateString)) return new Date(dateString.replace(/\//g, '-') + 'T00:00:00Z');
    if (dmySlash.test(dateString)) {
      const [dd, mm, yyyy] = dateString.split('/');
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    }

    const m = dateString.match(dMon);
    if (m) {
      const day = parseInt(m[1], 10);
      const monAbbr = m[2].toLowerCase();
      const map: Record<string, number> = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };
      const month = map[monAbbr];
      if (month) return new Date(Date.UTC(2025, month - 1, day));
    }

    const d = new Date(dateString);
    if (!isNaN(d.getTime())) return d;
    return null;
  };

  const formatDate = (dateString: string | null) => {
    const d = parseDateAssume2025(dateString);
    if (!d) return 'غير محدد';
    return d.toLocaleDateString('ar-EG');
  };

  const computeRenewalDate = (charging: string | null, existingRenewal: string | null): Date | null => {
    const existing = parseDateAssume2025(existingRenewal);
    if (existing) return existing;
    const base = parseDateAssume2025(charging);
    if (!base) return null;
    const result = new Date(base);
    // اليوم 31 من تاريخ الشحن (بعد 30 يوم)
    result.setUTCDate(result.getUTCDate() + 30);
    return result;
  };

  const formatRenewal = (charging: string | null, renewal: string | null) => {
    const d = computeRenewalDate(charging, renewal);
    if (!d) return 'غير محدد';
    return d.toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قائمة العملاء</h2>
        <Button onClick={onAddCustomer} className="hover-scale">
          <Plus className="h-4 w-4 ml-2" />
          إضافة عميل جديد
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">رقم العميل</TableHead>
              <TableHead className="text-right">اسم العميل</TableHead>
              <TableHead className="text-right">رقم الموبايل</TableHead>
              <TableHead className="text-right">نوع الخط</TableHead>
              <TableHead className="text-right">تاريخ الشحن</TableHead>
              <TableHead className="text-right">تاريخ التجديد</TableHead>
              <TableHead className="text-right">حالة الدفع</TableHead>
              <TableHead className="text-right">السعر الشهري</TableHead>
              <TableHead className="text-right">حالة التجديد</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow 
                key={customer.id} 
                className="hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TableCell className="font-medium">{customer.id}</TableCell>
                <TableCell>{customer.customer_name || 'غير محدد'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {String(customer.mobile_number)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.line_type} جيجا</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(customer.charging_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatRenewal(customer.charging_date, customer.renewal_date)}
                  </div>
                </TableCell>
                <TableCell>{getPaymentStatusBadge(customer.payment_status)}</TableCell>
                <TableCell>
                  {customer.monthly_price ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {customer.monthly_price} جنيه
                    </div>
                  ) : (
                    'غير محدد'
                  )}
                </TableCell>
                <TableCell>{getRenewalStatusBadge(customer.renewal_status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditCustomer(customer)}
                      className="h-8 w-8 hover-scale"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteCustomer(customer.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover-scale"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-muted-foreground text-lg">لا توجد بيانات عملاء</div>
          <Button onClick={onAddCustomer} className="mt-4 hover-scale">
            <Plus className="h-4 w-4 ml-2" />
            إضافة أول عميل
          </Button>
        </div>
      )}
    </div>
  );
};