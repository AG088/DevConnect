"use client"

import { useEffect, useRef } from "react"
import * as monaco from "monaco-editor"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme: "vs-dark",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 14,
        lineNumbers: "on",
        tabSize: 2,
      })

      monacoEditorRef.current.onDidChangeModelContent(() => {
        onChange(monacoEditorRef.current?.getValue() || "")
      })
    }

    return () => {
      monacoEditorRef.current?.dispose()
    }
  }, [language, onChange, value])

  useEffect(() => {
    if (monacoEditorRef.current) {
      if (monacoEditorRef.current.getValue() !== value) {
        monacoEditorRef.current.setValue(value)
      }
    }
  }, [value])

  useEffect(() => {
    if (monacoEditorRef.current) {
      monaco.editor.setModelLanguage(monacoEditorRef.current.getModel()!, language)
    }
  }, [language])

  return <div ref={editorRef} className="h-full w-full" />
}

