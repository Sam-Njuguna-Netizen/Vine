"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanManagement() {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [per, setPer] = useState("month");

  useEffect(() => {
    getAllPlans();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(lowerSearch) ||
        plan.description.toLowerCase().includes(lowerSearch)
    );
    setFilteredPlans(filtered);
  }, [searchText, plans]);

  const getAllPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/plan");
      if (res.data) {
        setPlans(res.data);
        setFilteredPlans(res.data);
      }
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
    setOpenPlanModal(true);
  };

  const resetModal = () => {
    setOpenPlanModal(false);
    setEditingPlan(null);
    setName("");
    setDescription("");
    setRegularPrice("");
    setSalePrice("");
    setPer("month");
  };

  const handleDelete = async (planId) => {
    try {
      const response = await axios.delete(`/api/plan/${planId}`);
      if (response.data.success) {
        getAllPlans();
        N("Success", "Plan deleted successfully!", "success");
      }
    } catch (error) {
      N("Error", "Failed to delete plan!", "error");
    }
  };

  const handleSavePlan = async () => {
    if (!name || !regularPrice || !salePrice || !per) {
      N("Error", "Required fields are missing!", "error");
      return;
    }

    const planData = {
      name,
      description,
      regularPrice,
      salePrice,
      per,
    };

    try {
      let response;
      if (editingPlan) {
        response = await axios.put(`/api/plan/${editingPlan.id}`, planData);
      } else {
        response = await axios.post("/api/plan", planData);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Plan Management</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => { setEditingPlan(null); setOpenPlanModal(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No plans found.</div>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex justify-between items-center">
                    {plan.name}
                    <Badge variant="secondary">{plan.per}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{plan.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground block">Regular:</span>
                      <span className="font-medium line-through text-muted-foreground">${plan.regularPrice}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Sale:</span>
                      <span className="font-bold text-green-600">${plan.salePrice}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                          <AlertDialogAction
                            onClick={() => handleDelete(plan.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Regular Price</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No plans found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell className="line-through text-muted-foreground">
                      ${plan.regularPrice}
                    </TableCell>
                    <TableCell className="text-green-600 font-bold">
                      ${plan.salePrice}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{plan.per}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                        >
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
                              <AlertDialogAction
                                onClick={() => handleDelete(plan.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
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
      )}

      <Dialog open={openPlanModal} onOpenChange={setOpenPlanModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update plan details." : "Create a new subscription plan."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g. Premium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Plan description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="regularPrice">Regular Price</Label>
                <Input
                  id="regularPrice"
                  type="number"
                  placeholder="0.00"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  prefix="$"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="0.00"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  prefix="$"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="per">Duration</Label>
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
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan}>
              {editingPlan ? "Update" : "Add"} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}