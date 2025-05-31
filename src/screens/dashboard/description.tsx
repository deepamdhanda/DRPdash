import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Form } from 'react-bootstrap';

type Props = {
  value?: string; // Initial HTML content
  onChange: (html: string) => void;
};

const DescriptionEditor: React.FC<Props> = ({ value = '', onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstanceRef.current) {
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['link', 'image', 'video']
          ]
        }
      });

      // Set initial content
      quillInstanceRef.current.root.innerHTML = value;

      // Listen to changes
      quillInstanceRef.current.on('text-change', () => {
        const html = editorRef.current!.querySelector('.ql-editor')!.innerHTML;
        onChange(html);
      });
    }
  }, [value, onChange]);

  return (
    <Form.Group>
      <Form.Label>Description</Form.Label>
      <div ref={editorRef} style={{ height: '300px', marginBottom: '1rem' }} />
    </Form.Group>
  );
};

export default DescriptionEditor;
