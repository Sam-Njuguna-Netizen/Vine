import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, ArrowUpDown, Calendar, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";

export default function AssignmentTable({ assignments = [], role = "student", onAction }) {
    return (
        <div className="rounded-md max-md:rounded-none">
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-md max-md:rounded-none overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead className="w-[300px]">
                                <div className="flex items-center gap-2">
                                    Assignment Title <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Course <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    Deadline <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No assignments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignments.map((assignment) => {
                                const isExpired = dayjs(assignment.submissionBefore).isBefore(dayjs());
                                const isSubmitted = assignment.submitThisUser;

                                return (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium text-slate-900 dark:text-white">
                                            {assignment.title}
                                        </TableCell>
                                        <TableCell className="text-slate-500 dark:text-slate-400">
                                            {assignment.courseTitle || assignment.course?.title || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-slate-500 dark:text-slate-400">
                                            {dayjs(assignment.submissionBefore).format("MMM D, YYYY h:mm A")}
                                        </TableCell>
                                        <TableCell>
                                            {isSubmitted ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                    Unsubmitted
                                                </Badge>
                                            ) : isExpired ? (
                                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                                    Expired
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                                    Active
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {role === "instructor" ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => onAction("view_submissions", assignment)}>
                                                            View Submissions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => onAction("edit", assignment)}>
                                                            Edit Assignment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => onAction("delete", assignment)} className="text-red-600">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                // Student Actions Table
                                                !isExpired && !isSubmitted ? (
                                                    <Button
                                                        size="sm"
                                                        className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                                        onClick={() => onAction("start", assignment)}
                                                    >
                                                        Start
                                                    </Button>
                                                ) : isSubmitted ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => onAction("view_result", assignment)}
                                                    >
                                                        View Result
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Closed</span>
                                                )
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
                {assignments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                        No assignments found.
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const isExpired = dayjs(assignment.submissionBefore).isBefore(dayjs());
                        const isSubmitted = assignment.submitThisUser;

                        return (
                            <div key={assignment.id} className="bg-white max-md:rounded-none dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all hover:shadow-md min-w-[280px] snap-center shrink-0">
                                {/* Header Section */}
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-base text-slate-900 dark:text-slate-50 leading-tight">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {assignment.courseTitle || assignment.course?.title || "N/A"}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        {isSubmitted ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                Submitted
                                            </Badge>
                                        ) : isExpired ? (
                                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                                Expired
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Date/Info Section */}
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md max-md:rounded-none">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">Due:</span>
                                    <span>{dayjs(assignment.submissionBefore).format("MMM D, YYYY h:mm A")}</span>
                                </div>

                                {/* Actions Section */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    {role === "instructor" ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    Manage Assignment <MoreVertical className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                <DropdownMenuItem onSelect={() => onAction("view_submissions", assignment)}>
                                                    View Submissions
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => onAction("edit", assignment)}>
                                                    Edit Assignment
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => onAction("delete", assignment)} className="text-red-600">
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        // Student Actions Mobile
                                        !isExpired && !isSubmitted ? (
                                            <Button
                                                className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-sm"
                                                onClick={() => onAction("start", assignment)}
                                            >
                                                Start Assignment
                                            </Button>
                                        ) : isSubmitted ? (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => onAction("view_result", assignment)}
                                            >
                                                View Result
                                            </Button>
                                        ) : (
                                            <Button variant="secondary" disabled className="w-full opacity-70">
                                                Submission Closed
                                            </Button>
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}