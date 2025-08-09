import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { CustomerTable } from "@/components/CustomerTable";
import { CustomerForm } from "@/components/CustomerForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Plus } from "lucide-react";

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

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
    setActiveTab("customers");
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleSaveCustomer = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {!showForm ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-2 animate-scale-in shadow-lg bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                <BarChart3 className="h-4 w-4" />
                لوحة التحكم
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                <Users className="h-4 w-4" />
                العملاء
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-8">
            <Dashboard />
          </TabsContent>

          <TabsContent value="customers" className="mt-8">
            <CustomerTable 
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={handleCancelForm}
        />
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={handleAddCustomer}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover-scale animate-bounce bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};