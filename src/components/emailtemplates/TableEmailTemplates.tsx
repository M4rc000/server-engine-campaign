import { useState, useMemo, useDeferredValue, useRef, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { LuArrowBigLeftDash } from "react-icons/lu";
import { LuArrowBigRightDash } from "react-icons/lu";
import { LuArrowBigLeft } from "react-icons/lu";
import { LuArrowBigRight } from "react-icons/lu";
import { FaRegTrashAlt } from "react-icons/fa";
import { BiSolidEditAlt } from "react-icons/bi";
import { IoIosCopy } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";
import Button from "../ui/button/Button";
import type { SortingState } from '@tanstack/react-table';
import { useSidebar } from "../../context/SidebarContext";
import Swal from '../utils/AlertContainer';
import DuplicateEmailTemplateModal from './DuplicateEmailTemplateModal';
import ShowEmailTemplateDetailModal from './ShowEmailTemplateDetailModal';
import EditEmailTemplateModal from './EditEmailTemplateModal';
import DeleteEmailTemplateModal from './DeleteEmailTemplateModal';

// Assuming AttachmentMetadata is defined in a shared models file or similar
type AttachmentMetadata = {
  id: number;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  filePath?: string;
};

// Update EmailTemplate interface to include attachments
interface EmailTemplate{
  id: number;
  name: string;
  envelopeSender: string;
  subject: string;
  bodyEmail: string;
  language: string;
  isSystemTemplate: number;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  updatedAt: string;
  updatedBy: number;
  updatedByName: string;
  attachments?: AttachmentMetadata[]; // Added attachments field
}

export default function TableEmailTemplates({ reloadTrigger, onReload }: { reloadTrigger?: number, onReload?: () => void }){
  const [search, setSearch] = useState('');
  const { isExpanded } = useSidebar();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const deferredSearch = useDeferredValue(search);
  const inputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<EmailTemplate[]>([]);
  const [activeModal, setActiveModal] = useState< 'duplicate' | 'detail' | 'edit' | 'delete' | null>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // FETCH DATA
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }
      try {
      // For fetching all templates, the backend's GetEmailTemplates controller
      // needs to be updated to preload attachments.
      // Assuming your backend's /email-template/all endpoint now returns attachments.
      const res = await fetch(`${API_URL}/email-template/all`, {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch data');

      const result = await res.json();
      // Ensure result.Data (or result.data) contains the attachments field
      setData(result.Data || result.data || result);
      } catch (err) {
        console.log('Error: ', err);
        Swal.fire({
          text: 'Failed to load email template data',
          duration: 3000,
          icon: "error"
        });
      } finally {
        setIsLoading(false);
      }
    }, [API_URL, token]); 

    useEffect(() => {
      fetchData(true);

      const intervalId = setInterval(() => {
        fetchData(false);
      }, 5000);

      return () => clearInterval(intervalId);
    }, [reloadTrigger, fetchData]);

  // ACTIVATE FUNCTION MODAL
  const onDuplicate = (emailTemplate: EmailTemplate) => {
    setSelectedEmailTemplate(emailTemplate);
    setActiveModal('duplicate');
  }
  
  const onShowDetail = (emailTemplate: EmailTemplate) => {
    setSelectedEmailTemplate(emailTemplate);
    setActiveModal('detail');
  }
  
  const onEdit = async (emailTemplate: EmailTemplate) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/email-template/${emailTemplate.id}`, {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch detailed email template data');

      const result = await res.json();
      
      setSelectedEmailTemplate(result.Data || result.data || result); 
      setActiveModal('edit');
    } catch (err) {
      console.error('Error fetching detailed email template for edit:', err);
      Swal.fire({
        text: 'Failed to load email template details for editing.',
        duration: 3000,
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const onDelete = (emailTemplate: EmailTemplate) => {
    setSelectedEmailTemplate(emailTemplate);
    setActiveModal('delete');
  }

  const columns = useMemo<ColumnDef<EmailTemplate>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        cell: info => info.row.index + 1,
        size: 10,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 10,
      },
      {
        accessorKey: 'envelopeSender',
        header: 'Envelope Sender',
        size: 10,
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        size: 10,
      },
      {
        accessorKey: 'isSystemTemplate',
        header: 'Default?',
        size: 95,
        cell: ({ getValue }) =>{
          const raw = getValue();
          if(raw == 1){
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-400 text-green-100 dark:bg-green-700 dark:text-green-100 rounded-full">Yes</span>
          } else {
            return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full">No</span>
          }
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Created \nAt',
        size: 10,
        cell: ({ getValue }) => {
          const raw = getValue();
          if (!raw || (typeof raw !== 'string' && typeof raw !== 'number' && !(raw instanceof Date))) return '-';

          const date = new Date(raw);
          if (isNaN(date.getTime())) return '-';
          
          return date.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).replace(' pukul ', ' ');
        }
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Modified',
        size: 10,
        cell: ({ getValue }) => {
          const raw = getValue();
          if (!raw || typeof raw !== 'string' || raw.trim() === '') return '-';

          const date = new Date(raw);
          if (isNaN(date.getTime()) || date.getFullYear() < 2000) return '-';

          return date.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).replace(' pukul ', ' ');
        }
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Action',
        size: 120,
        cell: (row) => (
          <div className='pr-5 lg:px-3'>
            <div className="grid grid-cols-2 gap-8 lg:gap-3 p-1 space-x-2">
              <div>
                <Button size="xs" variant="success" onClick={() => onDuplicate(row.row.original)}>
                  <IoIosCopy />
                </Button>
              </div>
              <div>
                <Button size="xs" variant="info" onClick={() => onShowDetail(row.row.original)}>
                  <FaCircleInfo />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 lg:gap-3 p-1 space-x-2">
              <div>
                <Button size="xs" variant="warning" onClick={() => onEdit(row.row.original)}>
                  <BiSolidEditAlt />
                </Button>
              </div>
              <div>
                <Button size="xs" variant="danger" onClick={() => onDelete(row.row.original)}>
                  <FaRegTrashAlt />
                </Button>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [API_URL, token] // Add API_URL and token to dependencies for onEdit's useCallback
  );

  const table = useReactTable({
    data: data,
    columns,
    state: {
      globalFilter: deferredSearch,
      pagination: pagination,
      sorting: sorting,
    },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination, 
  });

  useEffect(() => {
    fetchData(true); // Initial fetch with loader
  }, [fetchData]); // Depend on fetchData

  useEffect(() => {
  if (reloadTrigger && reloadTrigger > 0) {
    fetchData(true); // Force fetch with loader on reload trigger
  }
  }, [reloadTrigger, fetchData]);


  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03] dark:border-gray-800 border mx-4 shadow-xl">
      <div className="p-4 rounded-tl-lg rounded-tr-lg bg-white dark:bg-white/[0.03]">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm dark:text-gray-600 text-gray-700"
                >
                  {[5, 10, 20, 50, 100].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>
            {/* SEARCH BAR */}
            <div className={`relative ${isExpanded ? 'xl:mx-36' : 'xl:mx-70'}`}>
              <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    fill=""
                    />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
              <button className="absolute right-2.5 xl:px-3 xl:w-12 xl:left-92 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                <span className='text-center'> ⌘ </span>
                <span> K </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <Table className="min-w-full">
            <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const isSorted = header.column.getIsSorted();
                      const canSort = header.column.getCanSort();

                      return (
                        <td
                          key={header.id}
                          className="
                            relative 
                            px-3 py-3
                            text-center text-gray-500 text-sm font-medium
                            cursor-pointer select-none
                            whitespace-nowrap overflow-hidden text-ellipsis
                            bg-gray-50 dark:bg-gray-800/50
                            border-b border-gray-200 dark:border-gray-700"
                          style={{
                            width: header.getSize(),
                            maxWidth: header.getSize()
                          }}
                          >
                          <div
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center justify-center gap-1">
                            <span className="truncate">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>

                            {canSort && (
                              <div className="flex flex-col text-xs leading-none">
                                <span
                                  className={`
                                    ${isSorted === "asc"
                                      ? "text-gray-800 dark:text-gray-200"
                                      : "text-gray-300 dark:text-gray-600"}
                                  `}
                                >
                                  ▲
                                </span>
                                <span
                                  className={`
                                    ${isSorted === "desc"
                                      ? "text-gray-800 dark:text-gray-200"
                                      : "text-gray-300 dark:text-gray-600"
                                    }`}
                                >
                                  ▼
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Column Resize Handle */}
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity"
                            />
                          )}
                        </td>
                      )
                    })}
                  </TableRow>
                ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="relative h-[40px]">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic">
                      <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="px-5 py-3 text-sm text-gray-600 text-center border-b border-gray-100 dark:border-gray-800">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="relative h-[40px]">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic">
                      No data available
                    </div>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
        {/* Entries Info */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-0">
            <span>
              Showing{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {table.getFilteredRowModel().rows.length}
              </span>{' '}
              entries
            </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-1">
            {/* First Page Button */}
            <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className={`
                  inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600
                  ${!table.getCanPreviousPage()
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }
                  transition-colors duration-200
                `}
                title="First page"
            >
                <LuArrowBigLeftDash size={20}/>
            </button>

            {/* Previous Page Button */}
            <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={`
                  inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600
                  ${!table.getCanPreviousPage()
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }
                  transition-colors duration-200 
                `}
                title="Previous page"
            >
                <LuArrowBigLeft size={20}/>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
                {(() => {
                    const currentPage = table.getState().pagination.pageIndex;
                    const totalPages = table.getPageCount();
                    const pages = [];

                    // Always show first page
                    if (totalPages > 0) {
                        pages.push(
                            <button
                                key={0}
                                onClick={() => table.setPageIndex(0)}
                                className={`
                                  inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg
                                  ${currentPage === 0
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm'
                                  }
                                  transition-colors duration-200
                                `}
                            >
                                1
                            </button>
                        );
                    }

                    // Show ellipsis if there's a gap
                    if (currentPage > 3) {
                        pages.push(
                            <span key="ellipsis-start" className="inline-flex items-center justify-center w-9 h-9 text-sm text-gray-400 dark:text-gray-500">
                                ...
                            </span>
                        );
                    }

                    // Show pages around current page
                    const start = Math.max(1, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = start; i <= end; i++) {
                        if (i !== 0 && i !== totalPages - 1) {
                            pages.push(
                                <button
                                    key={i}
                                    onClick={() => table.setPageIndex(i)}
                                    className={`
                                      inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg
                                      ${currentPage === i
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm'
                                      }
                                      transition-colors duration-200
                                    `}
                                >
                                    {i + 1}
                                </button>
                            );
                        }
                    }

                    // Show ellipsis if there's a gap
                    if (currentPage < totalPages - 4) {
                        pages.push(
                            <span key="ellipsis-end" className="inline-flex items-center justify-center w-9 h-9 text-sm text-gray-400 dark:text-gray-500">
                                ...
                            </span>
                        );
                    }

                    // Always show last page (if more than 1 page)
                    if (totalPages > 1) {
                        pages.push(
                            <button
                                key={totalPages - 1}
                                onClick={() => table.setPageIndex(totalPages - 1)}
                                className={`
                                  inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg
                                  ${currentPage === totalPages - 1
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm'
                                  }
                                  transition-colors duration-200
                                `}
                            >
                                {totalPages}
                            </button>
                        );
                    }

                    return pages;
                })()}
            </div>

            {/* Next Page Button */}
            <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={`
                  inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600
                  ${!table.getCanNextPage()
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }
                  transition-colors duration-200 mr-1 // Tambah margin kanan sedikit
                `}
                title="Next page"
            >
                <LuArrowBigRight size={20}/>
            </button>

            {/* Last Page Button */}
            <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className={`
                  inline-flex items-center justify-center w-9 h-9 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600
                  ${!table.getCanNextPage()
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }
                  transition-colors duration-200
                `}
                title="Last page"
            >
                <LuArrowBigRightDash size={20}/>
            </button>
        </div>
      </div>

      {/* DUPLICATE MODAL */}
      <DuplicateEmailTemplateModal 
        isOpen={activeModal === 'duplicate'}
        onClose={() => {
          setActiveModal(null);
          setSelectedEmailTemplate(null);
        }}
        emailTemplate={selectedEmailTemplate}
      />
      
      {/* SHOW MODAL */}
      <ShowEmailTemplateDetailModal 
        isOpen={activeModal === 'detail'}
        onClose={() => {
          setActiveModal(null);
          setSelectedEmailTemplate(null);
        }}
        emailTemplate={selectedEmailTemplate}
      />

      {/* EDIT MODAL */}
      <EditEmailTemplateModal 
        isOpen={activeModal === 'edit'}
        onClose={() => {
          setActiveModal(null);
          setSelectedEmailTemplate(null);
        }}
        emailTemplate={selectedEmailTemplate}
        onEmailTemplateUpdated={() => {
          fetchData()
        }}    
      />

      {/* DELETE MODAL */}
      <DeleteEmailTemplateModal 
        isOpen={activeModal === 'delete'}
        onClose={() => {
          setActiveModal(null);
          setSelectedEmailTemplate(null);
        }}
        emailTemplate={
          selectedEmailTemplate
        }
        onEmailTemplateDeleted={() => {
          fetchData();
          if (onReload) onReload();
        }}
      />    
    </div>
  );
}
