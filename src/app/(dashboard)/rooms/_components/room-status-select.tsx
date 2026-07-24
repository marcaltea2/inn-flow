import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import { formatString } from "~/lib/format-string";
import { RoomStatus } from "@prisma/client";

type Room = RouterOutputs["room"]["getAll"]["rooms"][number];

export function RoomStatusSelect({ room, }: { room: Room;  }) {
  const utils = api.useUtils();

  const setStatusMutation = api.room.setStatus.useMutation({
    onSuccess: async () => {
      toast.success("Room status updated");
      await utils.room.getAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Select
      value={formatString(room.status)}
      onValueChange={(v) =>
        setStatusMutation.mutate({ roomId: room.id, status: v as RoomStatus })
      }
      disabled={setStatusMutation.isPending}
    >
      <SelectTrigger id={`status-${room.id}`}>
        <SelectValue>{formatString(room.status)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.values(RoomStatus)
          .filter((status) => status !== RoomStatus.OCCUPIED)
          .map((status) => (
            <SelectItem key={status} value={status}>
              {formatString(status)}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}