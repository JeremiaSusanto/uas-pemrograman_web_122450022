import { useState } from "react";
import TanamanForm from "../components/TanamanForm";
import TanamanCard from "../components/TanamanCard";

const Tanaman = () => {
  const [tanamanList, setTanamanList] = useState([]);
  const [tanamanEdit, setTanamanEdit] = useState(null); // untuk mode edit

  const handleSubmit = (data) => {
    if (tanamanEdit) {
      // mode edit
      setTanamanList((prev) =>
        prev.map((item) => (item.id === data.id ? data : item))
      );
      setTanamanEdit(null); // keluar dari mode edit
    } else {
      // mode tambah
      setTanamanList([...tanamanList, data]);
    }
  };

  const handleDelete = (id) => {
    setTanamanList(tanamanList.filter((item) => item.id !== id));
  };

  const handleEdit = (tanaman) => {
    setTanamanEdit(tanaman);
  };

  return (
    <div className="p-4 space-y-4">
      <TanamanForm
        onSubmit={handleSubmit}
        initialData={tanamanEdit}
        isEdit={!!tanamanEdit}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tanamanList.map((tanaman) => (
          <TanamanCard
            key={tanaman.id}
            tanaman={tanaman}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default Tanaman;
