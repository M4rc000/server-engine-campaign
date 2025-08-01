import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react'
import EditEmailTemplateModalForm, {EditEmailTemplateModalFormRef} from './EditEmailTemplateModalForm'
import { useRef, useState } from 'react'
import Swal from '../utils/AlertContainer'

// Assuming AttachmentMetadata is defined in a shared models file or similar
type AttachmentMetadata = {
  id: number;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  filePath?: string;
};

// Update EmailTemplate type to include attachments
type EmailTemplate = {
  id: number;
  name: string;
  envelopeSender: string;
  isSystemTemplate: number;
  subject: string;
  language: string; 
  bodyEmail: string;
  attachments?: AttachmentMetadata[]; // Added attachments field
};

export type EditEmailTemplateModalProps = {
  isOpen: boolean
  emailTemplate: EmailTemplate | null;
  onClose: () => void
  onEmailTemplateUpdated?: () => void;
}

export default function EditEmailTemplateModal({
  isOpen,
  onClose,
  onEmailTemplateUpdated,
  emailTemplate,
}: EditEmailTemplateModalProps) {
  const formRef = useRef<EditEmailTemplateModalFormRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog open={isOpen} onClose={()=>{}} className="relative z-[999]">
        {/* Backdrop with fade animation */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/40 backdrop-filter backdrop-blur-xs"/>
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Panel with scale & slide-up animation */}
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300 ease-out"
            enterFrom="translate-y-4 opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="transition-transform duration-200 ease-in"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-4 opacity-0 scale-95"
          >
            <DialogPanel className="w-full box-border rounded-lg bg-white dark:bg-gray-900 shadow-xl overflow-hidden dark:border dark:border-gray-700 flex flex-col max-h-[90vh] xl:mt-5 z-[9999999999999]">
              
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Email Template
                </DialogTitle>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {/* Pass emailTemplate (which now includes attachments) to the form */}
                <EditEmailTemplateModalForm ref={formRef} emailTemplate={emailTemplate!}/>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-200 dark:text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      
                      const success = await formRef.current?.submitEmailTemplate();
                      
                      if (success) {
                        onClose();
                        Swal.fire({
                          text: 'Email template updated successfully',
                          icon: "success",
                          duration: 3000,
                        })
                        
                        // Call callback to refresh data in the table
                        if (onEmailTemplateUpdated) {
                          onEmailTemplateUpdated();
                        }
                      } else {
                        // Error message is handled by EditEmailTemplateModalForm's Swal.fire
                        // No need for a generic error here, unless specific to this modal logic
                      }
                    } catch (error) {
                      console.log('Error: ', error);
                      Swal.fire({
                        text: 'An error occurred while updating email template!',
                        icon: "error",
                        duration: 3000
                      })
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </DialogPanel>

          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
