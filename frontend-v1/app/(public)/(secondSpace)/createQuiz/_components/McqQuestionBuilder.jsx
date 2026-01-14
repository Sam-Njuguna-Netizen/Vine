"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const McqQuestionBuilder = ({ onSave, onCancel, initialData = null }) => {
    const [question, setQuestion] = useState(initialData?.question || "");
    const [options, setOptions] = useState(
        initialData?.options || [{ name: "" }, { name: "" }]
    );
    const [correctAnswer, setCorrectAnswer] = useState(initialData?.answer || "");

    const handleAddOption = () => {
        setOptions([...options, { name: "" }]);
    };

    const handleRemoveOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = { name: value };
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        const filledOptions = options.filter(opt => opt.name.trim());
        if (filledOptions.length < 2) {
            alert("Please provide at least 2 options");
            return;
        }

        if (!correctAnswer) {
            alert("Please select a correct answer");
            return;
        }

        if (!filledOptions.some(opt => opt.name === correctAnswer)) {
            alert("Correct answer must match one of the options");
            return;
        }

        onSave({
            question: question.trim(),
            questionType: "MCQ",
            options: filledOptions,
            answer: correctAnswer,
            points: 1
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="question" className="text-sm font-medium mb-2 block">
                    Question *
                </Label>
                <Textarea
                    id="question"
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="w-full"
                />
            </div>

            <div>
                <Label className="text-sm font-medium mb-2 block">Options *</Label>
                <div className="space-y-2">
                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                placeholder={`Option ${index + 1}`}
                                value={opt.name}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1"
                            />
                            {options.length > 2 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveOption(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Option
                    </Button>
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium mb-2 block">Correct Answer *</Label>
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
                    {options.filter(opt => opt.name.trim()).map((opt, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.name} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="cursor-pointer">
                                {opt.name}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                    Save Question
                </Button>
            </div>
        </div>
    );
};

export default McqQuestionBuilder;
