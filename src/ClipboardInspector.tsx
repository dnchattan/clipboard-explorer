import React from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { v4 as uuid } from "uuid";
import pretty from "pretty";
import { Radio } from "antd";
const cleanHtml = require("clean-html");

export interface ClipboardData {
  id: string;
  data: string;
  type: string;
  model: any;
}

function format(value: string, type: string): string {
  switch (type) {
    case "text/html":
      let formattedHtml = value;
      cleanHtml.clean(
        value,
        { "add-break-around-tags": ["span"] },
        (html) => (formattedHtml = html)
      );
      return formattedHtml;
    //return pretty(value);
    default:
      return value;
  }
}

export const ClipboardInspector: React.FunctionComponent<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>> = (props) => {
  const monaco = useMonaco();
  const [data, setData] = React.useState<ClipboardData[]>([]);
  const [selectedType, setSelectedType] = React.useState<string>();

  const editorRef = React.useRef<any>(null);
  const onMount = React.useCallback(
    (editor: any) => (editorRef.current = editor),
    []
  );

  const options = React.useMemo(
    () =>
      data.map((item) => (
        <Radio.Button key={item.type} value={item.type}>
          {item.type}
        </Radio.Button>
      )),
    [data]
  );

  const onPaste = React.useCallback(
    ({ clipboardData }: React.ClipboardEvent) => {
      const data = clipboardData.types.map((type) => {
        const data = format(clipboardData.getData(type), type);
        const id = uuid();
        const model = monaco.editor.createModel(
          data,
          type,
          monaco.Uri.parse(id)
        );
        return {
          id,
          data,
          type,
          model
        };
      });
      setData(data);
    },
    [monaco]
  );

  const onSelectedChanged = React.useCallback<
    React.ChangeEventHandler<HTMLSelectElement>
  >((ev) => {
    setSelectedType(ev.target.value);
  }, []);

  const selectedPath = data.find((item) => item.type === selectedType)?.id;

  return (
    <div {...props}>
      <div onPaste={onPaste} tabIndex={0} className="PasteBox">
        Paste content here
      </div>
      <div>
        <Radio.Group value={selectedType} onChange={onSelectedChanged}>
          {options}
        </Radio.Group>
      </div>
      <div style={{ flex: 1 }}>
        <Editor onMount={onMount} height="100%" path={selectedPath} />
      </div>
    </div>
  );
};
