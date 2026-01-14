"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const TrueFalseQuestionBuilder = ({ onSave, onCancel, initialData = null }) => {
    const [question, setQuestion] = useState(initialData?.question || "");
    const [correctAnswer, setCorrectAnswer] = useState(initialData?.answer || "");

    const handleSubmit = () => {
        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        if (!correctAnswer) {
            alert("Please select the correct answer (True or False)");
            return;
        }

        onSave({
            question: question.trim(),
            questionType: "TRUE_FALSE",
            options: [{ name: "True" }, { name: "False" }],
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
                    placeholder="Enter your True/False question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="w-full"
                />
            </div>

            <div>
                <Label className="text-sm font-medium mb-2 block">Correct Answer *</Label>
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="True" id="true-option" />
                        <Label htmlFor="true-option" className="cursor-pointer">
                            True
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="False" id="false-option" />
                        <Label htmlFor="false-option" className="cursor-pointer">
                            False
                        </Label>
                    </div>
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

export default TrueFalseQuestionBuilder;
