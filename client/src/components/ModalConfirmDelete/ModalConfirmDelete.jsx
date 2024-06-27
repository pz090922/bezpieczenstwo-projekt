import React from "react";

export default function ModalConfirmDelete({ isVisible, onClose, onDelete }) {
  if (!isVisible) return null;
  return (
    <div className="fixed text-white inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center">
      <div className="flex flex-col w-[600px] bg-zinc-800 rounded-2xl p-4">
        <button
          className="text-white font-bold place-self-end"
          onClick={() => onClose()}
        >
          X
        </button>
        <div className="flex flex-col items-center justify-between gap-10">
          <div className="font-bold text-xl">
            Czy na pewno chcesz usunąć swoje konto?
          </div>
          <div className="flex gap-5 mb-10">
            {/* <button
              onClick={() => onDelete()}
              className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-red-600 font-bold hover:bg-red-700"
            >
              Usuń konto
            </button> */}
            <button
              onClick={() => onClose()}
              className="flex pt-1 pb-1 pr-4 pl-4 rounded-xl bg-sky-600 font-bold hover:bg-sky-700"
            >
              Wróć
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
