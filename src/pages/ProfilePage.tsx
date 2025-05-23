import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [departments, setDepartments] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, department")
          .eq("id", user.id)
          .single();

        if (data) {
          setFullName(data.full_name || "");
          setDepartment(data.department || "");
        }
      }
    };

    const loadDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from("departments")
          .select("id, name")
          .order("name");

        if (error) throw error;

        if (data && data.length > 0) {
          setDepartments(data);
          // If department is not set or not in the list, set to first department
          if (!department && data.length > 0) {
            setDepartment(data[0].name);
          }
        } else {
          // Fallback departments if none in database
          const fallbackDepts = [{ id: "technology", name: "Technology" }];
          setDepartments(fallbackDepts);
          if (!department) {
            setDepartment("Technology");
          }
        }
      } catch (err) {
        console.error("Error loading departments:", err);
        // Fallback departments
        const fallbackDepts = [{ id: "technology", name: "Technology" }];
        setDepartments(fallbackDepts);
        if (!department) {
          setDepartment("Technology");
        }
      }
    };

    loadProfile();
    loadDepartments();
  }, [user?.id, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setError(null);

      // Update existing profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          department: department,
          email: user?.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      setError(error.message || "Failed to update profile");
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Button>
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-500 font-medium">
                Error: {error}
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
