import { useState, useEffect } from "react";
import Button from "../../components/ui/button/Button";
import NewRoleModal from "../../components/rolemanagement/NewRoleModal";
import TableRoles from "../../components/rolemanagement/TableRoles";
import CardHeader from "../../components/rolemanagement/CardHeader";

export default function RoleManagement() { 
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const fetchData = () => {
    setReloadTrigger(prev => prev + 1); 
  };

  useEffect(() => {
  }, [reloadTrigger]);


  return (
    <div className="p-4 min-h-screen">
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <CardHeader reloadTrigger={reloadTrigger}/>
        </div>
      </div>

      <Button
        className="text-md mt-2 mb-4 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out text-white"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        New Role
      </Button>

        <TableRoles reloadTrigger={reloadTrigger} onReload={fetchData}/>

      <NewRoleModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        onRoleAdded={() => {
          setModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}