import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComingSoon } from "@/context/ComingSoonContext";
import { useLang } from "@/context/useLang";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function ComingSoonDialog() {
  const { isOpen, close } = useComingSoon();
  const { t } = useLang();

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
            <Rocket className="h-8 w-8 text-indigo-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900">{t("comingSoon.title")}</DialogTitle>
          <DialogDescription className="mt-2 text-base text-slate-600">
            {t("comingSoon.subtitle")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-6">
          <DialogClose asChild>
            <Button variant="gradient" className="w-full sm:w-auto">{t("comingSoon.button")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
