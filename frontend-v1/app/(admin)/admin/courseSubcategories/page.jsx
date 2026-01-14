"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

import { allSubcategories, addSubcategory, updateSubcategory, deleteSubcategory, allCategories } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";

export default function CourseSubcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", categoryId: "", description: "" });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = subcategories.filter((item) =>
      item.name.toLowerCase().includes(lowerSearch) ||
      (item.category?.name || "").toLowerCase().includes(lowerSearch)
    );
    setFilteredSubcategories(filtered);
  }, [searchText, subcategories]);

  const fetchData = async () => {
    const [subRes, catRes] = await Promise.all([allSubcategories(), allCategories()]);

    if (subRes?.success) {
      const formatted = subRes.data.map((item, index) => ({ ...item, key: index.toString() }));
      setSubcategories(formatted);
      setFilteredSubcategories(formatted);
    }
    if (catRes?.success) {
      setCategories(catRes.categories);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.category_id.toString(),
      description: item.description
    });
    setOpenModal(true);
  };

  const resetModal = () => {
    setOpenModal(false);
    setEditingItem(null);
    setFormData({ name: "", categoryId: "", description: "" });
  };

  const handleDelete = async (id) => {
    const response = await deleteSubcategory(id);
    if (response.success) {
      fetchData();
      N("Success", "Subcategory deleted successfully!", "success");
    } else {
      N("Error", "Failed to delete subcategory!", "error");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.categoryId) {
      N("Error", "Name and Category are required!", "error");
      return;
    }

    let response;
    const payload = {
      ...formData,
      categoryId: parseInt(formData.categoryId)
    };

    if (editingItem) {
      response = await updateSubcategory({ id: editingItem.id, ...payload });
    } else {
      response = await addSubcategory(payload);
    }

    if (response.success) {
      fetchData();
      N("Success", `Subcategory ${editingItem ? "updated" : "added"} successfully!`, "success");
      resetModal();
    } else {
      N("Error", response.message || "Operation failed!", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subcategories..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Subcategory
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subcategory Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubcategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No subcategories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSubcategories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name || "N/A"}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={item.description}>
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
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
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the subcategory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
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

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Make changes to the subcategory here."
                : "Add a new subcategory to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium">
                Category
              </label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? "Save Changes" : "Create Subcategory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
