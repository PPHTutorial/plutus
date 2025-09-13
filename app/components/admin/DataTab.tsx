'use client';

import React from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Filter,
    Download
} from 'lucide-react';

interface Column {
    key: string;
    label: string;
    render?: (value: any, item: any) => React.ReactNode;
}

interface DataTabProps {
    title: string;
    data: any[];
    columns: Column[];
    onCRUD: (action: string, entity: string, itemData?: any, id?: string) => void;
    onOpen: (action: string, entity: string, itemData?: any) => void;
    entityType: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    currentPage: Record<string, number>;
    setCurrentPage: (pages: Record<string, number>) => void;
    itemsPerPage: number;
}

export default function DataTab({
    title,
    data,
    columns,
    onCRUD,
    onOpen,
    entityType,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage
}: DataTabProps) {
    const page = currentPage[entityType] || 1;

    // Filter data based on search term
    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        setCurrentPage({
            ...currentPage,
            [entityType]: newPage
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
                    <p className="text-slate-600 mt-1 text-sm">
                        Showing {paginatedData.length} of {filteredData.length} items
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="hidden sm:inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={() => onCRUD('create', entityType)}
                        className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add New</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-80 border border-slate-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 w-full sm:w-auto justify-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                                    >
                                        {column.label}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {paginatedData.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-slate-50">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {column.render
                                                ? column.render(item[column.key], item)
                                                : String(item[column.key] || '-')
                                            }
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onOpen('view', entityType, item)}
                                                className="text-slate-400 hover:text-slate-600 p-1"
                                                title="View"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onOpen('edit', entityType, item)}
                                                className="text-green-600 hover:text-green-900 p-1"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onOpen('delete', entityType, item)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <button className="text-slate-400 hover:text-slate-600 p-1">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 gap-3">
                        <div className="text-sm text-slate-700 text-center sm:text-left">
                            Showing{' '}
                            <span className="font-medium">{startIndex + 1}</span>
                            {' '}to{' '}
                            <span className="font-medium">
                                {Math.min(startIndex + itemsPerPage, filteredData.length)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{filteredData.length}</span>
                            {' '}results
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-2 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="hidden sm:flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (page <= 3) {
                                        pageNumber = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${page === pageNumber
                                                    ? 'z-10 bg-green-600 border-green-600 text-white'
                                                    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile page indicator */}
                            <div className="sm:hidden px-3 py-2 text-sm text-slate-700 bg-slate-50 rounded-md">
                                {page} / {totalPages}
                            </div>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="relative inline-flex items-center px-2 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                )}

                {/* Empty State */}
                {filteredData.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-slate-400 text-lg mb-2">No data found</div>
                        <p className="text-slate-500">
                            {searchTerm
                                ? 'Try adjusting your search terms or filters'
                                : 'Get started by adding your first item'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => onCRUD('create', entityType)}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Item
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
