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
import { MoreVertical, ArrowUpDown, FileText, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";

export default function SubmittedAssignmentsTable({ submissions = [], role = "instructor", onAction }) {
    return (
        <div className="rounded-md max-md:rounded-none">
            <div className="rounded-md max-md:rounded-none">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">
                                    <div className="flex items-center gap-2">
                                        Student Name <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        Course <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center gap-2">
                                        Assignment <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>

                                <TableHead>Submitted On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium text-slate-900 dark:text-white">
                                            {submission.user?.profile?.name || submission.user?.email || "Unknown"}
                                        </TableCell>
                                        <TableCell className="text-slate-500 dark:text-slate-400">
                                            {submission.assignment?.course?.title || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                                            {submission.assignment?.title || "N/A"}
                                        </TableCell>

                                        <TableCell className="text-slate-500 dark:text-slate-400">
                                            {dayjs(submission.createdAt).format("MMM D, YYYY")}
                                        </TableCell>
                                        <TableCell>
                                            {submission.mark ? (
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                    Graded: {submission.mark}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {role === "instructor" ? (
                                                        <>
                                                            <DropdownMenuItem onSelect={() => onAction("mark", submission)}>
                                                                Mark / Grade
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        // Student View (if they can see their own submissions here)
                                                        <DropdownMenuItem onSelect={() => onAction("view_feedback", submission)}>
                                                            View Feedback
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onSelect={() => window.open(submission.path, "_blank")}>
                                                        <Download className="mr-2 h-4 w-4" /> Download
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
                    {submissions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No submissions found.
                        </div>
                    ) : (
                        submissions.map((submission) => (
                            <div key={submission.id} className="bg-white max-md:rounded-none dark:bg-slate-900 border rounded-lg p-4 space-y-3 shadow-sm min-w-[280px] snap-center shrink-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {submission.user?.profile?.name || submission.user?.email || "Unknown"}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {submission.assignment?.title || "N/A"}
                                        </p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {submission.assignment?.course?.title || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        {submission.mark ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                Graded: {submission.mark}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">Submitted:</span> {dayjs(submission.createdAt).format("MMM D, YYYY")}
                                </div>

                                <div className="pt-2 border-t flex justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full">
                                                Actions <MoreVertical className="ml-2 h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {role === "instructor" ? (
                                                <>
                                                    <DropdownMenuItem onSelect={() => onAction("mark", submission)}>
                                                        Mark / Grade
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                // Student View
                                                <DropdownMenuItem onSelect={() => onAction("view_feedback", submission)}>
                                                    View Feedback
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onSelect={() => window.open(submission.path, "_blank")}>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
