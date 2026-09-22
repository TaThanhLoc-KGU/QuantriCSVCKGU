import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import clsx from "clsx";
import { adminApi } from "../api";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadFolder?: string;
}

export function RichTextEditor({ value, onChange, placeholder, uploadFolder = "posts" }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Nhập nội dung…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-content min-h-64 max-h-[32rem] overflow-y-auto rounded-b-md px-3 py-2 focus:outline-none",
      },
    },
  });

  // Dong bo khi content duoc nap tu ngoai (vd fetch bai viet de sua) - tranh vong lap voi onUpdate
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function handleImageSelected(file: File) {
    if (!editor) return;
    setUploading(true);
    setUploadError(null);
    try {
      const media = await adminApi.media.upload(file, uploadFolder);
      editor.chain().focus().setImage({ src: media.url, alt: media.originalName }).run();
    } catch {
      setUploadError("Tải ảnh thất bại.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border border-neutral-300 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
      <Toolbar editor={editor} onPickImage={() => fileInputRef.current?.click()} onSetLink={setLink} uploading={uploading} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
      />
      <EditorContent editor={editor} />
      {uploadError && <p className="border-t border-neutral-200 px-3 py-1.5 text-xs text-urgent-600">{uploadError}</p>}
    </div>
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={clsx(
        "flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm font-medium transition-colors disabled:opacity-40",
        active ? "bg-brand-100 text-brand-700" : "text-neutral-600 hover:bg-neutral-100",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onPickImage,
  onSetLink,
  uploading,
}: {
  editor: Editor;
  onPickImage: () => void;
  onSetLink: () => void;
  uploading: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
      <ToolbarButton title="Đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton title="Nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton title="Gạch chân" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton title="Gạch ngang" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Tiêu đề 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton title="Tiêu đề 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Danh sách chấm" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •≡
      </ToolbarButton>
      <ToolbarButton title="Danh sách số" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1≡
      </ToolbarButton>
      <ToolbarButton title="Trích dẫn" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        ❝
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Căn trái" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        ⟸
      </ToolbarButton>
      <ToolbarButton title="Căn giữa" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        ⟺
      </ToolbarButton>
      <ToolbarButton title="Căn phải" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        ⟹
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Chèn liên kết" active={editor.isActive("link")} onClick={onSetLink}>
        🔗
      </ToolbarButton>
      <ToolbarButton title="Chèn ảnh" onClick={onPickImage} disabled={uploading}>
        {uploading ? "…" : "🖼"}
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Hoàn tác" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton title="Làm lại" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-neutral-300" />;
}
