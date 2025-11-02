'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Column {
    accessor: string;
    header: string;
}

interface DataTableProps {
    data: any[];
    columns: Column[];
}

export function DataTable({ data, columns }: DataTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead key={column.accessor}>
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, i) => (
                    <TableRow key={i}>
                        {columns.map((column) => (
                            <TableCell key={column.accessor}>
                                {row[column.accessor]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}