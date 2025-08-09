import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Calendar, Wifi } from "lucide-react";

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
}

interface UserDashboardProps {
  userType: string;
  username: string;
}

export const UserDashboard = ({ userType, username }: UserDashboardProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [userType, username]);

  const fetchCustomerData = async () => {
    try {
      let query = supabase.from('cardinfo').select('*');
      
      if (userType === "multiple") {
        // For multiple user, filter by customer name
        query = query.eq('customer_name', username);
      } else if (userType === "single") {
        // For single user, filter by mobile number
        query = query.eq('mobile_number', parseInt(username));
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDateAssume2025 = (dateString: string | null): Date | null => {
    if (!dateString) return null;

    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const ymdSlash = /^\d{4}\/\d{2}\/\d{2}$/;
    const dmySlash = /^\d{2}\/\d{2}\/\d{4}$/;
    const dMon = /^(\d{1,2})-(\w{3})$/i;

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

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-muted-foreground text-lg">لا توجد بيانات متاحة</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in transition-all duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
          مرحباً {userType === "single" && customers.length > 0 ? customers[0].customer_name : username}
        </h2>
        <p className="text-muted-foreground text-lg">
          {userType === "multiple" ? "بيانات خطوطك" : "بيانات خطك"}
        </p>
      </div>

      <div className="grid gap-6">
        {customers.map((customer, index) => (
          <Card key={customer.id} className="animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-blue-500" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-600" />
                بيانات الخط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">رقم الموبايل:</span>
                  <span className="text-blue-600 font-semibold">{customer.mobile_number}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">نوع الخط:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">{customer.line_type} جيجا</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">تاريخ الشحن:</span>
                  <span className="text-purple-600 font-semibold">{formatDate(customer.charging_date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">تاريخ التجديد:</span>
                  <span className="text-orange-600 font-semibold">{formatRenewal(customer.charging_date, customer.renewal_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};