"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductPhotosEditor({ initialUrls }: { initialUrls: string[] }) {
  const [kept, setKept] = useState<string[]>(initialUrls);

  return (
    <div>
      <input type="hidden" name="existingImageUrls" value={JSON.stringify(kept)} />

      {kept.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {kept.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-lg object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setKept((prev) => prev.filter((u) => u !== url))}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
                aria-label="Remover foto"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        name="imageFiles"
        accept="image/*"
        multiple
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-pink-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-pink-600"
      />
      <p className="mt-1 text-xs text-stone-400">
        Pode escolher várias fotos de uma vez. Elas entram no carrossel do cardápio.
      </p>
    </div>
  );
}
