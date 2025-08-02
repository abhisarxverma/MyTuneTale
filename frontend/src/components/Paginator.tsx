import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationLink,
    PaginationEllipsis
} from "@/components/ui/pagination";
import clsx from "clsx";

interface PaginatorProps {
    currentPage: number;
    totalPage: number;
    pageChangeHandler: (newPageNumber: number) => void;
}

export default function Paginator({ currentPage, totalPage, pageChangeHandler }: PaginatorProps) {
    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];

        if (totalPage <= 7) {
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPage - 2) {
                pages.push("ellipsis");
            }

            pages.push(totalPage);
        }

        return pages;
    };

    const pagesToRender = getPageNumbers();

    return (
        <Pagination className="flex justify-center sm:justify-end">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) pageChangeHandler(currentPage - 1);
                        }}
                        className={clsx(currentPage === 1 && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>

                {pagesToRender.map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    pageChangeHandler(page);
                                }}
                                className={clsx(currentPage === page ? "bg-zinc-200 text-black" : "bg-zinc-600")}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPage) pageChangeHandler(currentPage + 1);
                        }}
                        className={clsx(currentPage === totalPage && "pointer-events-none opacity-50")}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
