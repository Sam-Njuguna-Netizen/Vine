"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ShortAnswerQuestionBuilder = ({ onSave, onCancel, initialData = null }) => {
    const [question, setQuestion] = useState(initialData?.question || "");
    const [correctAnswer, setCorrectAnswer] = useState(initialData?.answer || "");

    const handleSubmit = () => {
        if (!question.trim()) {
            alert("Please enter a question");
            return;
        }

        if (!correctAnswer.trim()) {
            alert("Please enter the correct answer");
            return;
        }

        onSave({
            question: question.trim(),
            questionType: "SHORT_ANSWER",
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
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="w-full"
                />
            </div>

            <div>
                <Label htmlFor="answer" className="text-sm font-medium mb-2 block">
                    Correct Answer *
                </Label>
                <Input
                    id="answer"
                    type="text"
                    placeholder="Enter the correct answer"
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Note: Grading will be case-insensitive (e.g., "Paris" = "paris")
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

export default ShortAnswerQuestionBuilder;
