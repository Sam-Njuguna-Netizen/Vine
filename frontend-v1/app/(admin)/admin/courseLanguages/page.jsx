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

import { allLanguages, addLanguage, updateLanguage, deleteLanguage } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";

export default function CourseLanguages() {
  const [languages, setLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = languages.filter((item) =>
      item.name.toLowerCase().includes(lowerSearch) ||
      item.code.toLowerCase().includes(lowerSearch)
    );
    setFilteredLanguages(filtered);
  }, [searchText, languages]);

  const fetchData = async () => {
    const response = await allLanguages();
    if (response?.success) {
      const formatted = response.data.map((item, index) => ({ ...item, key: index.toString() }));
      setLanguages(formatted);
      setFilteredLanguages(formatted);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, code: item.code });
    setOpenModal(true);
  };

  const resetModal = () => {
    setOpenModal(false);
    setEditingItem(null);
    setFormData({ name: "", code: "" });
  };

  const handleDelete = async (id) => {
    const response = await deleteLanguage(id);
    if (response.success) {
      fetchData();
      N("Success", "Language deleted successfully!", "success");
    } else {
      N("Error", "Failed to delete language!", "error");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      N("Error", "Name and Code are required!", "error");
      return;
    }

    let response;
    if (editingItem) {
      response = await updateLanguage({ id: editingItem.id, ...formData });
    } else {
      response = await addLanguage(formData);
    }

    if (response.success) {
      fetchData();
      N("Success", `Language ${editingItem ? "updated" : "added"} successfully!`, "success");
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
              placeholder="Search languages..."
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
          <Plus className="mr-2 h-4 w-4" /> Add Language
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Language Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLanguages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No languages found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLanguages.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.code}</TableCell>
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
                              This action cannot be undone. This will permanently delete the language.
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
              {editingItem ? "Edit Language" : "Add Language"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Make changes to the language here."
                : "Add a new language to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                placeholder="e.g. English"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="code" className="text-right text-sm font-medium">
                Code
              </label>
              <Input
                id="code"
                placeholder="e.g. en"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? "Save Changes" : "Create Language"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
