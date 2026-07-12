"use client";

import { cn } from "@/lib/utils";
import { tripStatusLabel, type TripStatus } from "@/features/trips/api";

type StepState = "done" | "current" | "upcoming" | "cancelled";

type Step = {
    key: string;
    label: string;
    caption: string;
    state: StepState;
};

const mainFlow: TripStatus[] = ["draft", "dispatched", "completed"];

const captionByStatus: Record<TripStatus, string> = {
    draft: "Trip created",
    dispatched: "In transit",
    completed: "Delivered",
    cancelled: "Trip cancelled",
};

const circleClassByState: Record<StepState, string> = {
    done: "border-[#2b7fd3] bg-[#2b7fd3]",
    current: "border-[#2b7fd3] bg-white ring-4 ring-[#2b7fd3]/15",
    upcoming: "border-gray-300 bg-white",
    cancelled: "border-red-500 bg-red-500",
};

const titleClassByState: Record<StepState, string> = {
    done: "text-[#1f2430]",
    current: "text-[#2b7fd3]",
    upcoming: "text-gray-400",
    cancelled: "text-red-600",
};

function stepsForStatus(status: TripStatus): Step[] {
    if (status === "cancelled") {
        return [
            {
                key: "draft",
                label: "Draft",
                caption: captionByStatus.draft,
                state: "done",
            },
            {
                key: "dispatched",
                label: "Dispatched",
                caption: captionByStatus.dispatched,
                state: "done",
            },
            {
                key: "cancelled",
                label: "Cancelled",
                caption: captionByStatus.cancelled,
                state: "cancelled",
            },
        ];
    }
    const activeIndex = mainFlow.indexOf(status);
    return mainFlow.map((key, index) => ({
        key,
        label: tripStatusLabel[key],
        caption: captionByStatus[key],
        state:
            index < activeIndex
                ? "done"
                : index === activeIndex
                  ? "current"
                  : "upcoming",
    }));
}

function StepCard({ step }: { step: Step }) {
    return (
        <div className="rounded-md border border-gray-100 bg-white px-2.5 py-1 text-center shadow-md">
            <p className={cn("text-xs", titleClassByState[step.state])}>{step.label}</p>
        </div>
    );
}

export function TripLifecycle({ status }: { status: TripStatus }) {
    const steps = stepsForStatus(status);
    const lastIndex = steps.length - 1;

    return (
        <div className="flex items-stretch">
            {steps.map((step, index) => {
                const isUp = index % 2 === 0;
                const leftFilled =
                    index > 0 && steps[index - 1].state === "done";
                const rightFilled = step.state === "done";

                return (
                    <div
                        key={step.key}
                        className="flex min-w-0 flex-1 flex-col items-center"
                    >
                        <div className="flex h-10 w-full items-end justify-center px-1.5 pb-2">
                            {isUp ? <StepCard step={step} /> : null}
                        </div>

                        <div className="relative flex h-4 w-full items-center justify-center">
                            {index > 0 ? (
                                <span
                                    className={cn(
                                        "absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2",
                                        leftFilled
                                            ? "bg-[#2b7fd3]"
                                            : "bg-gray-200",
                                    )}
                                />
                            ) : null}
                            {index < lastIndex ? (
                                <span
                                    className={cn(
                                        "absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2",
                                        rightFilled
                                            ? "bg-[#2b7fd3]"
                                            : "bg-gray-200",
                                    )}
                                />
                            ) : null}
                            <span
                                className={cn(
                                    "relative z-10 size-3.5 rounded-full border-2",
                                    circleClassByState[step.state],
                                )}
                            />
                        </div>

                        <div className="flex h-10 w-full items-start justify-center px-1.5 pt-2">
                            {!isUp ? <StepCard step={step} /> : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
