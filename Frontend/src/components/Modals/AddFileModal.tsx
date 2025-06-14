import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddFileModal({
  isCreatingItem,
  setIsCreatingItem,
  newItemType,
  newItemName,
  setNewItemName,
  handleCreateNewItem,
  parentId,
}: {
  isCreatingItem: boolean;
  setIsCreatingItem: (isCreatingItem: boolean) => void;
  newItemType: "file" | "folder";
  newItemName: string;
  setNewItemName: (newItemName: string) => void;
  handleCreateNewItem: () => void;
  parentId: string | null;
}) {
  return (
    <Dialog open={isCreatingItem} onOpenChange={setIsCreatingItem}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800">
        <DialogTitle className="text-gray-400">
          {newItemType === "file" ? "New File" : "New Folder"}
        </DialogTitle>
        <div className="grid gap-4 py-4">
          {!parentId && (
            <p className="text-sm text-gray-400">
              Creating a new {newItemType} in project root. Drag the newly
              created item to your desired folder.
            </p>
          )}
          <Input
            placeholder={
              newItemType === "file" ? "filename.extension" : "folder name"
            }
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                handleCreateNewItem();
              }
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => setIsCreatingItem(false)}
          >
            Cancel
          </Button>
          <Button variant={"default"} onClick={handleCreateNewItem}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
