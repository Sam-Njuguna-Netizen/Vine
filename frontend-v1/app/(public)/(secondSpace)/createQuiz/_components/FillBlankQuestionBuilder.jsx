"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

const FillBlankQuestionBuilder = ({ onSave, onCancel, initialData = null }) => {
    const [question, setQuestion] = useState(initialData?.question || "");
    const [correctAnswer, setCorrectAnswer] = useState(initialData?.answer || "");

    const handleSubmit = () => {
        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        if (!question.includes("___")) {
            alert("Question must include ___ (three underscores) to indicate the blank");
            return;
        }

        if (!correctAnswer.trim()) {
            alert("Please enter the correct answer to fill in the blank");
            return;
        }

        onSave({
            question: question.trim(),
            questionType: "FILL_BLANK",
            options: null,
            answer: correctAnswer.trim(),
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
                    placeholder="Enter your question with ___ for the blank (e.g., The capital of France is ___)"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="w-full"
                />
                <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Use three underscores (_____) to indicate where students should fill in the answer.
                        Example: "The mitochondria is the ___ of the cell."
                    </p>
                </div>
            </div>

            <div>
                <Label htmlFor="answer" className="text-sm font-medium mb-2 block">
                    Correct Answer *
                </Label>
                <Input
                    id="answer"
                    type="text"
                    placeholder="Enter the word/phrase that fills the blank"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Note: Grading will be case-insensitive (e.g., "Powerhouse" = "powerhouse")
                </p>
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

export default FillBlankQuestionBuilder;
