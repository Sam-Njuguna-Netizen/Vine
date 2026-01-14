"use client";
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import { Plus, X, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { N } from "@/app/utils/notificationService";
import { checkObjectFields } from "@/app/utils/common";
import axiosInstance from "@/app/api/axios";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

const BookAddEditModel = forwardRef((props, ref) => {
  const [open, setModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);

  const [pricingModel, setPricingModel] = useState("Paid");
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for managing category options (formats/styles)
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [optionInputVisible, setOptionInputVisible] = useState(false);
  const [optionInputValue, setOptionInputValue] = useState("");
  const optionInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const getAllCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/bookCategory");
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load categories.";
      N("Error", errorMessage, "error");
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  useEffect(() => {
    if (optionInputVisible) {
      optionInputRef.current?.focus();
    }
  }, [optionInputVisible]);

  const openModal = (book = null) => {
    if (book && book.id) {
      // Check for edit mode
      setEditingBookId(book.id);
      setTitle(book.title);
      setCategoryId(book.categoryId ? book.categoryId.toString() : null);
      setDescription(book.description);
      setFeaturedImage(book.featuredImage || "");
      setPricingModel(book.pricingModel || "Paid");
      setRegularPrice(book.regularPrice || 0);
      setSalePrice(book.salePrice || 0);
      setShippingFee(book.shippingFee || 0);
      // Parse category options from the book data
      try {
        const parsedOptions = JSON.parse(book.categoryOption || "[]");
        setCategoryOptions(Array.isArray(parsedOptions) ? parsedOptions : []);
      } catch (e) {
        setCategoryOptions([]);
      }
    } else {
      // Reset for new item
      resetModalStates();
      setEditingBookId(null);
    }
    setModalOpen(true);
  };

  const notifyParent = (status = true) => {
    if (props.sendMessage) {
      props.sendMessage(status);
    }
  };

  useImperativeHandle(ref, () => ({
    openModal,
  }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "BookCovers");

    try {
      const response = await axiosInstance.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = `${response.data.publicUrl}`;
      N("Success", "Image uploaded successfully", "success");
      setFeaturedImage(url);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Upload failed";
      N("Error", errorMessage, "error");
    }
  };

  const resetModalStates = () => {
    setTitle("");
    setDescription("");
    setPricingModel("Paid");
    setRegularPrice(0);
    setSalePrice(0);
    setShippingFee(0);
    setFeaturedImage("");
    setCategoryId(null);
    setEditingBookId(null);
    setIsSubmitting(false);
    setCategoryOptions([]);
    setOptionInputValue("");
    setOptionInputVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeModal = () => {
    resetModalStates();
    setModalOpen(false);
  };

  const handleSaveBook = async () => {
    setIsSubmitting(true);
    const bookData = {
      categoryId: parseInt(categoryId),
      title,
      description,
      pricingModel,
      regularPrice: pricingModel === "Paid" ? Number(regularPrice) : 0,
      salePrice: pricingModel === "Paid" ? Number(salePrice) : 0,
      shippingFee: pricingModel === "Paid" ? Number(shippingFee) : 0,
      featuredImage,
      categoryOption: categoryOptions, // Use the state array
    };

    const requiredFields = [
      "title",
      "categoryId",
      "description",
      "featuredImage",
    ];
    // Validation for category options
    if (categoryOptions.length === 0) {
      N(
        "Error",
        "Please add at least one format/style option (e.g., eBook, Paperback).",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    const ch = checkObjectFields(bookData, requiredFields);
    if (!ch.success) {
      N("Error", ch.message, "error");
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      if (editingBookId) {
        response = await axiosInstance.put(
          `/api/book/${editingBookId}`,
          bookData
        );
      } else {
        response = await axiosInstance.post("/api/book", bookData);
      }
      notifyParent(true);
      N(
        "Success",
        `Book ${editingBookId ? "updated" : "added"} successfully!`,
        "success"
      );
      closeModal();
    } catch (error) {
      notifyParent(false);
      N(
        "Error",
        error.response?.data?.message ||
        "An error occurred while saving the book.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers for Category Options UI ---
  const handleCloseOption = (removedOption) => {
    const newOptions = categoryOptions.filter(
      (option) => option !== removedOption
    );
    setCategoryOptions(newOptions);
  };

  const showOptionInput = () => setOptionInputVisible(true);

  const handleOptionInputChange = (e) => setOptionInputValue(e.target.value);

  const handleOptionInputConfirm = () => {
    if (optionInputValue && !categoryOptions.includes(optionInputValue)) {
      setCategoryOptions([...categoryOptions, optionInputValue]);
    }
    setOptionInputVisible(false);
    setOptionInputValue("");
  };

  return (
    <Dialog open={open} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBookId ? "Edit Item" : "Add New Item"}
          </DialogTitle>
          <DialogDescription>
            {editingBookId
              ? "Make changes to the product details."
              : "Add a new product to your store."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Name*</Label>
              <Input
                id="title"
                placeholder="Enter product title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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
          </div>

          <div className="space-y-2">
            <Label>Formats/Styles*</Label>
            <div className="flex flex-wrap items-center gap-2 border p-2 rounded-md min-h-[42px]">
              {categoryOptions.map((option) => (
                <Badge key={option} variant="secondary" className="gap-1">
                  {option}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleCloseOption(option)}
                  />
                </Badge>
              ))}
              {optionInputVisible ? (
                <Input
                  ref={optionInputRef}
                  type="text"
                  className="h-6 w-24 text-xs"
                  value={optionInputValue}
                  onChange={handleOptionInputChange}
                  onBlur={handleOptionInputConfirm}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleOptionInputConfirm();
                    }
                  }}
                />
              ) : (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-dashed hover:bg-accent"
                  onClick={showOptionInput}
                >
                  <Plus className="h-3 w-3 mr-1" /> New Option
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">About*</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Enter product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Pricing Model*</Label>
            <RadioGroup
              value={pricingModel}
              onValueChange={setPricingModel}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Free" id="free" />
                <Label htmlFor="free">Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Paid" id="paid" />
                <Label htmlFor="paid">Paid</Label>
              </div>
            </RadioGroup>
          </div>

          {pricingModel === "Paid" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">Regular Price*</Label>
                <Input
                  id="regularPrice"
                  placeholder="e.g., 19.99"
                  type="number"
                  value={regularPrice}
                  min={0}
                  onChange={(e) =>
                    setRegularPrice(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                  id="salePrice"
                  placeholder="e.g., 9.99"
                  type="number"
                  value={salePrice}
                  min={0}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingFee">Shipping Fee</Label>
                <Input
                  id="shippingFee"
                  placeholder="e.g., 5.00"
                  type="number"
                  value={shippingFee}
                  min={0}
                  onChange={(e) =>
                    setShippingFee(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Cover Image*</Label>
            <div className="flex items-center gap-4">
              {featuredImage && (
                <div className="relative h-24 w-20 border rounded overflow-hidden">
                  <img
                    src={featuredImage}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-0 right-0 bg-destructive text-white p-1 rounded-bl"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <DragDropFileUpload
                  onFileSelect={(file) => handleFileChange({ target: { files: [file] } })}
                  selectedFile={featuredImage ? { name: "Current Cover", previewUrl: featuredImage } : null}
                  label="Upload Cover Image"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a cover image for your product.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSaveBook} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingBookId ? "Update Item" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

BookAddEditModel.displayName = "BookAddEditModel";

export default BookAddEditModel;
