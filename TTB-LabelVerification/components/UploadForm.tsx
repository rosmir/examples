'use client';

import { useRef, useState } from 'react';
import type { ApplicationData } from '@/types/label';

const TTB_WARNING =
  'GOVERNMENT WARNING: (1) ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. (2) CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.';

const EMPTY_FORM: ApplicationData = {
  brand_name: '',
  class_type: '',
  abv: '',
  net_contents: '',
  bottler_name: '',
  bottler_address: '',
  country_of_origin: '',
  warning_statement: TTB_WARNING,
};

interface Props {
  onSubmit: (image: File, appData: ApplicationData) => void;
  isLoading: boolean;
}

export default function UploadForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<ApplicationData>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageSelect(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }

  function handleField(key: keyof ApplicationData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;
    onSubmit(imageFile, form);
  }

  const canSubmit =
    imageFile &&
    form.brand_name.trim() &&
    form.class_type.trim() &&
    form.abv.trim() &&
    form.net_contents.trim() &&
    form.bottler_name.trim() &&
    form.warning_statement.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Image upload */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Step 1 — Upload Label Image</h2>
        <div
          className={`border-4 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : imagePreview
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Label preview"
                className="max-h-64 mx-auto rounded-lg shadow object-contain"
              />
              <p className="text-sm text-gray-600 font-medium">
                {imageFile?.name} &mdash; click to change
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700">Drop label image here or click to browse</p>
              <p className="text-sm text-gray-500">JPG, PNG, WEBP — up to 10 MB</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Application data fields */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 2 — Enter Application Data</h2>
        <p className="text-sm text-gray-500 mb-5">
          Enter the information from the COLA application form. This is what the label will be checked against.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Brand Name *"
            placeholder="e.g. OLD TOM DISTILLERY"
            value={form.brand_name}
            onChange={(v) => handleField('brand_name', v)}
            required
          />
          <Field
            label="Class / Type *"
            placeholder="e.g. Kentucky Straight Bourbon Whiskey"
            value={form.class_type}
            onChange={(v) => handleField('class_type', v)}
            required
          />
          <Field
            label="Alcohol Content (ABV) *"
            placeholder="e.g. 45% or 90 Proof"
            value={form.abv}
            onChange={(v) => handleField('abv', v)}
            required
          />
          <Field
            label="Net Contents *"
            placeholder="e.g. 750 mL"
            value={form.net_contents}
            onChange={(v) => handleField('net_contents', v)}
            required
          />
          <Field
            label="Bottler / Producer Name *"
            placeholder="e.g. Old Tom Distillery LLC"
            value={form.bottler_name}
            onChange={(v) => handleField('bottler_name', v)}
            required
          />
          <Field
            label="Bottler Address"
            placeholder="e.g. 123 Barrel Lane, Louisville, KY 40202"
            value={form.bottler_address}
            onChange={(v) => handleField('bottler_address', v)}
          />
          <Field
            label="Country of Origin"
            placeholder="Leave blank for domestic products"
            value={form.country_of_origin}
            onChange={(v) => handleField('country_of_origin', v)}
          />
        </div>

        {/* Warning statement — full width textarea */}
        <div className="mt-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Government Warning Statement *
            <span className="ml-2 font-normal text-gray-500">
              (must match label exactly — word for word)
            </span>
          </label>
          <textarea
            rows={4}
            value={form.warning_statement}
            onChange={(e) => handleField('warning_statement', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        className="w-full py-4 px-6 text-lg font-semibold rounded-xl text-white transition-colors
          disabled:bg-gray-300 disabled:cursor-not-allowed
          enabled:bg-blue-700 enabled:hover:bg-blue-800 enabled:active:bg-blue-900"
      >
        {isLoading ? 'Analyzing label…' : 'Verify Label'}
      </button>
    </form>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
