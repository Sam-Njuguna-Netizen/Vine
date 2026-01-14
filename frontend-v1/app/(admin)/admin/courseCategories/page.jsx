"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

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

import { addCategory, allCategories, updateCategory, deleteCategory } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";

export default function CourseCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    getAllCategories();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(lowerSearch)
    );
    setFilteredCategories(filtered);
  }, [searchText, categories]);

  const getAllCategories = async () => {
    const response = await allCategories();
    if (response?.success) {
      const formattedCategories = response.categories.map((category, index) => ({
        key: index.toString(),
        id: category.id,
        name: category.name,
      }));
      setCategories(formattedCategories);
      setFilteredCategories(formattedCategories);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setOpenCategoryModal(true);
  };

  const resetModal = () => {
    setOpenCategoryModal(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleDelete = async (categoryId) => {
    const response = await deleteCategory(categoryId);
    if (response.success) {
      getAllCategories();
      N("Success", "Category deleted successfully!", "success");
    } else {
      N("Error", "Failed to delete category!", "error");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName) {
      N("Error", "Category name is required!", "error");
      return;
    }

    if (editingCategory) {
      const updatedCategory = { id: editingCategory.id, name: categoryName };
      const response = await updateCategory(updatedCategory);
      if (response.success) {
        getAllCategories();
        N("Success", "Category updated successfully!", "success");
      } else {
        N("Error", "Failed to update category!", "error");
      }
    } else {
      const newCategory = { name: categoryName };
      const response = await addCategory(newCategory);
      if (response.success) {
        getAllCategories();
        N("Success", "Category added successfully!", "success");
      } else {
        N("Error", response.message || "Failed to add category!", "error");
      }
    }

    resetModal();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setOpenCategoryModal(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center h-24">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
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
                              This action cannot be undone. This will permanently delete the category.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
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

      <Dialog open={openCategoryModal} onOpenChange={setOpenCategoryModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Make changes to the category here."
                : "Add a new category to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
