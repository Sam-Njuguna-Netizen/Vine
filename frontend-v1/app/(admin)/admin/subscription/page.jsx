"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import moment from "moment";
import Countdown from "react-countdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { createStripeAccount } from "@/app/utils/stripe";
import { deleteUser } from "@/app/utils/auth";

export default function SubscriptionPage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>

      {(user?.institution?.expiryDate === null ||
        new Date(user?.institution?.expiryDate) < new Date()) && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Please subscribe first to get all the features.</span>
          </div>
        )}

      <Tabs defaultValue="my-subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="my-subscription">My Subscription</TabsTrigger>
          <TabsTrigger value="manage-plans">Manage Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="my-subscription" className="mt-6">
          <MySubscriptionTab />
        </TabsContent>

        <TabsContent value="manage-plans" className="mt-6">
          <ManagePlansTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MySubscriptionTab() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [check, setCheck] = useState(false);
  const [plans, setPlans] = useState([]);
  const [openPlanModal, setOpenPlanModal] = useState(false);

  useEffect(() => {
    getAllInstitutions();
    fetchStripeInfo();
    getAllPlan();
  }, []);

  const getAllPlan = async () => {
    try {
      const res = await axios.get("/api/plan");
      if (res.data) setPlans(res.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchStripeInfo = async () => {
    try {
      const stripe = await axios.get("/api/stripe/checkAdmin", {
        withCredentials: true,
      });
      setCheck(true);
    } catch (error) {
      setCheck(false);
    }
  };

  const getAllInstitutions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/myInstitution");
      if (res?.data?.success) {
        setInstitutions(res.data.institution);
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setLoading(false);
    }
  };

  const callCreateStripeAccount = async () => {
    N("Information", "Please wait...", "info");
    try {
      const res = await createStripeAccount("/api/stripe/institutionConnect");
      if (!res.success) {
        N("Error", res.message || "Failed to create Stripe account.", "error");
        return;
      }
      if (res.connectUrl) {
        window.location.href = res.connectUrl;
      } else {
        N("Error", "Stripe did not return a redirect URL.", "error");
      }
    } catch (error) {
      N("Error", error.message || "An unexpected error occurred.", "error");
    }
  };

  const updatePlan = async (planId) => {
    try {
      const res = await axios.post("/api/institutionPlan", { planId });
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe Checkout
      } else {
        N("Error", "Failed to initiate payment!", "error");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      N("Error", "Failed to update plan", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpenPlanModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Update Subscription
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution Name</TableHead>
              <TableHead>Short Form</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
              </TableRow>
            ) : institutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">No institutions found.</TableCell>
              </TableRow>
            ) : (
              institutions.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium">{inst.name}</TableCell>
                  <TableCell>{inst.shortForm}</TableCell>
                  <TableCell>{inst.contactNumber}</TableCell>
                  <TableCell>
                    {moment(inst.expiryDate).isAfter(moment()) ? (
                      <div className="text-green-600 font-medium">
                        <Countdown date={inst.expiryDate} />
                      </div>
                    ) : (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {check ? (
                      <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 cursor-default">
                        <CheckCircle className="mr-2 h-4 w-4" /> Stripe Connected
                      </Button>
                    ) : (
                      <Button onClick={callCreateStripeAccount}>
                        <CreditCard className="mr-2 h-4 w-4" /> Connect Stripe
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openPlanModal} onOpenChange={setOpenPlanModal}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Select Your Plan</DialogTitle>
            <DialogDescription>Choose a subscription plan that fits your needs.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl text-center">{plan.name}</CardTitle>
                  <CardDescription className="text-center">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-center">
                  <div className="text-3xl font-bold">
                    ${plan.salePrice}
                    <span className="text-sm font-normal text-muted-foreground"> / {plan.per}</span>
                  </div>
                  {plan.regularPrice > plan.salePrice && (
                    <div className="text-sm text-muted-foreground line-through mt-1">
                      ${plan.regularPrice}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => updatePlan(plan.id)}>
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPlanModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManagePlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planType, setPlanType] = useState("student"); // 'student' or 'instructor'

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [per, setPer] = useState("month");
  const [targetType, setTargetType] = useState("student");

  useEffect(() => {
    getAllPlans();
  }, []);

  const getAllPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/institutePlan");
      if (res.data) setPlans(res.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setRegularPrice(plan.regularPrice);
    setSalePrice(plan.salePrice);
    setPer(plan.per);
    setTargetType(plan.type || "student");
    setOpenModal(true);
  };

  const resetModal = () => {
    setOpenModal(false);
    setEditingPlan(null);
    setName("");
    setDescription("");
    setRegularPrice("");
    setSalePrice("");
    setPer("month");
    setTargetType(planType); // Default to current tab
  };

  const handleDelete = async (planId) => {
    try {
      const response = await axios.delete(`/api/institutePlan/${planId}`);
      if (response.data.success) {
        getAllPlans();
        N("Success", "Plan deleted successfully!", "success");
      }
    } catch (error) {
      N("Error", "Failed to delete plan!", "error");
    }
  };

  const handleSavePlan = async () => {
    if (!name || !regularPrice || !salePrice || !per || !targetType) {
      N("Error", "Required fields are missing!", "error");
      return;
    }

    const planData = {
      name,
      description,
      regularPrice,
      salePrice,
      per,
      type: targetType,
    };

    try {
      let response;
      if (editingPlan) {
        response = await axios.put(
          `/api/institutePlan/${editingPlan.id}`,
          planData
        );
      } else {
        response = await axios.post("/api/institutePlan", planData);
      }

      if (response.data.success) {
        getAllPlans();
        N(
          "Success",
          `Plan ${editingPlan ? "updated" : "added"} successfully!`,
          "success"
        );
        resetModal();
      }
    } catch (error) {
      N("Error", `Failed to ${editingPlan ? "update" : "add"} plan!`, "error");
    }
  };

  // Filter plans based on active tab
  const filteredPlans = plans.filter(p => (p.type || 'student') === planType);

  return (
    <div className="space-y-4">
      <Tabs value={planType} onValueChange={(val) => { setPlanType(val); setEditingPlan(null); }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="student">Student Plans</TabsTrigger>
          <TabsTrigger value="instructor">Instructor Plans</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={() => {
          resetModal();
          setOpenModal(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Regular Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Target Audience</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">Loading plans...</TableCell>
              </TableRow>
            ) : filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">No {planType} plans found.</TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.description}</TableCell>
                  <TableCell>${plan.regularPrice}</TableCell>
                  <TableCell className="text-green-600 font-medium">${plan.salePrice}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.per}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{plan.type || 'Student'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this plan? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(plan.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>{editingPlan ? "Update plan details." : "Create a new subscription plan."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetType">Target Audience</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Basic Plan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Plan description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">Regular Price</Label>
                <Input id="regularPrice" type="number" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input id="salePrice" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={per} onValueChange={setPer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="6 months">6 Months</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>Cancel</Button>
            <Button onClick={handleSavePlan}>{editingPlan ? "Update" : "Create"} Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
