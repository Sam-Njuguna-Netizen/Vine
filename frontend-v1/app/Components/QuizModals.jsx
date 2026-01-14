"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Award, HelpCircle } from "lucide-react";
import { calculateGrade } from "@/app/utils/courseService";

const Button = ({ children, onClick, disabled = false, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 ${className}`}
  >
    {children}
  </button>
);

// --- 1. Modal for Instructors to Add a New Quiz ---
export const AddQuizModal = ({ isOpen, onClose, onSave }) => {
  const [quizInfo, setQuizInfo] = useState({
    serialNo: "",
    title: "",
    description: "",
    duration: "00:10:00",
    submissionBefore: "",
  });
  const handleInputChange = (e) =>
    setQuizInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  useEffect(() => {
    if (isOpen)
      setQuizInfo({
        serialNo: "",
        title: "",
        description: "",
        duration: "00:10:00",
        submissionBefore: "",
      });
  }, [isOpen]);

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Quiz
          </h2>
          <input
            name="serialNo"
            type="number"
            placeholder="Serial No*"
            value={quizInfo.serialNo}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <input
            name="title"
            placeholder="Quiz Title*"
            value={quizInfo.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={quizInfo.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            rows="3"
          ></textarea>
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Duration (HH:MM:SS)*
            </label>
            <input
              name="duration"
              type="time"
              step="1"
              value={quizInfo.duration}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Submission Deadline*
            </label>
            <input
              name="submissionBefore"
              type="datetime-local"
              value={quizInfo.submissionBefore}
              onChange={handleInputChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={() => onSave(quizInfo)}>Save Quiz</Button>
          </div>
        </div>
      </div>
    )
  );
};

// --- 2. Modal for Instructors to Add Questions ---
export const AddQuestionsModal = ({ isOpen, onClose, onSave }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuestion("");
      setOptions(["", ""]);
      setCorrectAnswer("");
    }
  }, [isOpen]);
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const addOption = () => setOptions([...options, ""]);
  const removeOption = (index) =>
    setOptions(options.filter((_, i) => i !== index));
  const handleSave = () =>
    onSave({
      question,
      options: options.map((opt) => ({ name: opt })),
      answer: correctAnswer,
    });

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Quiz Question
          </h2>
          <textarea
            placeholder="Question*"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            rows="3"
          ></textarea>
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 dark:text-gray-200">
              Options
            </label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-grow p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add Option
            </button>
          </div>
          <input
            placeholder="Correct Answer (must match an option exactly)*"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Question</Button>
            <Button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Complete
            </Button>
          </div>
        </div>
      </div>
    )
  );
};

// --- 3. Modal for Students to View Quiz Result ---
export const QuizResultModal = ({ isOpen, onClose, result }) => {
  return (
    isOpen &&
    result && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6 h-[90vh] flex flex-col">
          <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <Award size={48} className="mx-auto text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              Quiz Result
            </h2>
          </div>
          <div className="my-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your Score
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {result?.quizAnswer?.score} /{" "}
                {result?.quizAnswer?.quiz?.questions?.length}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Grade</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {calculateGrade(
                  result?.quizAnswer?.score,
                  result?.quizAnswer?.quiz?.questions?.length
                )}
              </p>
            </div>
          </div>
          <div className="flex-grow space-y-4 overflow-y-auto pr-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              Review Your Answers
            </h3>
            {JSON.parse(result?.quizAnswer.answers).map((item) => (
              <div
                key={item.questionId}
                className={`p-4 rounded-lg ${
                  item.isCorrect
                    ? "bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500"
                    : "bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500"
                }`}
              >
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {item.question}
                </p>
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                  You answered:{" "}
                  <span className="font-medium">
                    {item.selectedAnswer || "Not Answered"}
                  </span>
                </p>
                {!item.isCorrect && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Correct answer:{" "}
                    <span className="font-medium">{item.correctAnswer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    )
  );
};
