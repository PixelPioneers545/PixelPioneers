// src/components/Editor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  BoldIcon, ItalicIcon, StrikethroughIcon, 
  ListOrderedIcon, ListIcon, SmileIcon, 
  LinkIcon, ImageIcon, AlignLeftIcon, 
  AlignCenterIcon, AlignRightIcon 
} from './Icons';

// Simple emoji list for demonstration (replace with emoji-mart for full picker)
const EMOJIS = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓','😈','👿','👹','👺','💀','👻','👽','🤖','💩','😺','😸','😹','😻','😼','😽','🙀','😿','😾'
];

const Editor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const handleFormat = (format) => {
    document.execCommand(format, false, null);
    editorRef.current.focus();
  };

  const insertAtCursor = (text) => {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    // Move cursor after inserted emoji
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    editorRef.current.focus();
    handleEditorChange();
  };

  const handleInsertEmoji = (emoji) => {
    insertAtCursor(emoji);
    setShowEmojiPicker(false);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
    editorRef.current.focus();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.className = 'max-w-full h-auto';
        document.execCommand('insertHTML', false, img.outerHTML);
      };
      reader.readAsDataURL(file);
    }
    editorRef.current.focus();
  };

  const handleTextAlign = (align) => {
    document.execCommand('formatBlock', false, `<div style="text-align: ${align}"></div>`);
    editorRef.current.focus();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setInternalValue(newValue);
      onChange(newValue);
    }
  };

  // Update internal value when prop changes
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value || '');
    }
  }, [value]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 relative">
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleFormat('bold')}
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleFormat('italic')}
          title="Italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleFormat('strikethrough')}
          title="Strikethrough"
        >
          <StrikethroughIcon className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleFormat('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrderedIcon className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleFormat('insertUnorderedList')}
          title="Bullet List"
        >
          <ListIcon className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <div className="relative">
          <button 
            className="p-2 rounded hover:bg-gray-200"
            onClick={() => setShowEmojiPicker((v) => !v)}
            title="Insert Emoji"
            type="button"
          >
            <SmileIcon className="h-4 w-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute z-10 bg-white border rounded shadow-lg p-2 mt-2 max-w-xs max-h-48 overflow-y-auto grid grid-cols-8 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:bg-gray-100 rounded"
                  type="button"
                  onClick={() => handleInsertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={handleInsertLink}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <label 
          className="p-2 rounded hover:bg-gray-200 cursor-pointer"
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
          />
        </label>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleTextAlign('left')}
          title="Align Left"
        >
          <AlignLeftIcon className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleTextAlign('center')}
          title="Align Center"
        >
          <AlignCenterIcon className="h-4 w-4" />
        </button>
        <button 
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => handleTextAlign('right')}
          title="Align Right"
        >
          <AlignRightIcon className="h-4 w-4" />
        </button>
      </div>
      
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none"
        contentEditable
        onInput={handleEditorChange}
        dangerouslySetInnerHTML={{ __html: internalValue }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Editor;