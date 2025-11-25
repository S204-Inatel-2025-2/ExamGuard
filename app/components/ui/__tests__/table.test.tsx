import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "../table";
import { expect, test, describe } from "vitest";

describe("Table", () => {
  test("renders table structure correctly", () => {
    render(
      <Table>
        <TableCaption>Test Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer 1</TableCell>
            <TableCell>Footer 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByText("Test Caption")).toBeInTheDocument();
    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
    expect(screen.getByText("Footer 1")).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(table).toHaveClass("w-full caption-bottom text-sm");
  });
});
