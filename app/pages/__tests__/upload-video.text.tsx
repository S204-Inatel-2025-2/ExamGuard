import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UploadVideo from "../upload-video";
import { expect, test, describe, vi } from "vitest";

describe("UploadVideo", () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => "blob:mock-video-url");
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Initially displays the upload prompt", () => {
    render(<UploadVideo />);
    expect(
      screen.getByText(/clique para selecionar um vídeo/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("video")).not.toBeInTheDocument();
  });

  test("handleFileChange updates state and displays video preview", async () => {
    render(<UploadVideo />);
    const file = new File(["dummy content"], "video.mp4", {
      type: "video/mp4",
    });
    const input = screen.getByLabelText(/clique para selecionar um vídeo/i)
      .previousElementSibling as HTMLInputElement;

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText("video.mp4")).toBeInTheDocument();
    });
  });

  test("handleCancel resets state and clears the file input", async () => {
    render(<UploadVideo />);
    const file = new File(["dummy content"], "video.mp4", {
      type: "video/mp4",
    });
    const input = screen.getByLabelText(/clique para selecionar um vídeo/i)
      .previousElementSibling as HTMLInputElement;

    await userEvent.upload(input, file);

    const cancelButton = await screen.findByRole("button");
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.getByText(/clique para selecionar um vídeo/i),
      ).toBeInTheDocument();
      expect(screen.queryByText("video.mp4")).not.toBeInTheDocument();
      expect(input.value).toBe("");
    });
  });
});
