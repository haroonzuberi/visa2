"use client";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "./styles.module.css";
import IndiaFlag from "@/Assets/svgs/IndiaFlag";
// import MoreVerticalSvg from "@/Assets/svgs/MoreVerticalSvg";
import { Button } from "@/components/ui/button";
import CalendarSvg from "@/Assets/svgs/CalendarSvg";
import FlightSvg from "@/Assets/svgs/FlightSvg";
import AddButton from "@/Assets/svgs/AddBtton";
import MoreVerticalSvg from "@/Assets/svgs/MoreVerticalSvg";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchKanbanData,
  columnToStatusMap,
  updateApplicationStatus,
  updateBulkApplicationStatus,
  filterKanbanData,
} from "@/store/slices/kanbanSlice";

// Map API statuses to UI column IDs

// Add this skeleton component at the top of the file
const KanbanSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className={styles.boardContainer}>
        {[1, 2, 3, 4].map((column) => (
          <div key={column} className={`${styles.column} bg-white`}>
            <div className={styles.columnHeader}>
              <div className="flex justify-between items-center w-full">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            <div className={`${styles.taskList} gap-4`}>
              {[1, 2, 3].map((task) => (
                <div key={task} className={`${styles.task} animate-pulse`}>
                  <div className="flex justify-between mb-3">
                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function KanbanBoard() {
  const dispatch = useDispatch<AppDispatch>();
  const { applications_by_status, status_counts, isLoading }: any = useSelector(
    (state: RootState) => state.kanban
  );

  // Convert API data to match your UI structure
  const convertApiDataToColumns = () => {
    const columnsData = {
      todo: {
        id: "todo",
        title: "To Do",
        count: status_counts?.new || 0,
        tasks:
          applications_by_status?.new?.map((app) => ({
            id: app.id.toString(),
            title: app.applicant.name,
            applicationId: app.application_id,
            country: app.visa_country,
            applicationDate: new Date(app.created_at).toLocaleDateString(
              "en-US",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
            flightDate: new Date(app.updated_at).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          })) || [],
      },
      haveIssues: {
        id: "haveIssues",
        title: "Have Issues",
        count: status_counts?.ready_to_apply || 0,
        tasks:
          applications_by_status?.ready_to_apply?.map((app) => ({
            id: app.id.toString(),
            title: app.applicant.name,
            applicationId: app.application_id,
            country: app.visa_country,
            applicationDate: new Date(app.created_at).toLocaleDateString(
              "en-US",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
            flightDate: new Date(app.updated_at).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          })) || [],
      },
      done: {
        id: "done",
        title: "Done",
        count: status_counts?.need_gov_fee || 0,
        tasks:
          applications_by_status?.need_gov_fee?.map((app) => ({
            id: app.id.toString(),
            title: app.applicant.name,
            applicationId: app.application_id,
            country: app.visa_country,
            applicationDate: new Date(app.created_at).toLocaleDateString(
              "en-US",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
            flightDate: new Date(app.updated_at).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          })) || [],
      },
      rejected: {
        // id: "rejected",
        // title: "Rejected",
        // count: 0, // Add if you have rejected status in API
        // tasks: [],

        id: "rejected",
        title: "Rejected",
        count: status_counts?.rejected || 0,
        tasks:
          applications_by_status?.rejected?.map((app) => ({
            id: app.id.toString(),
            title: app.applicant.name,
            applicationId: app.application_id,
            country: app.visa_country,
            applicationDate: new Date(app.created_at).toLocaleDateString(
              "en-US",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            ),
            flightDate: new Date(app.updated_at).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          })) || [],
      },
    };
    return columnsData;
  };

  const [columns, setColumns] = useState(convertApiDataToColumns());

  useEffect(() => {
    dispatch(fetchKanbanData());
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setColumns(convertApiDataToColumns());
    }
  }, [applications_by_status, status_counts, isLoading]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Get the task being moved
    const task = sourceColumn.tasks.find((t) => t.id === draggableId);
    if (!task) return;

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      setColumns((prevColumns) => {
        return {
          ...prevColumns,
          [source.droppableId]: {
            ...sourceColumn,
            tasks: newTasks,
            count: newTasks.length, // Update the task count for this column
          },
        };
      });
    } else {
      // Moving from one column to another
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      // Get the new status from the destination column
      const newStatus = columnToStatusMap[destination.droppableId];

      try {
        // Update local state
        setColumns((prevColumns) => {
          return {
            ...prevColumns,
            [source.droppableId]: {
              ...sourceColumn,
              tasks: sourceTasks,
              count: sourceTasks.length, // Update the task count for the source column
            },
            [destination.droppableId]: {
              ...destColumn,
              tasks: destTasks,
              count: destTasks.length, // Update the task count for the destination column
            },
          };
        });

        // Call the update API with the correct parameters
        await dispatch(
          updateApplicationStatus({
            id: parseInt(task.id),
            new_status: newStatus,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    }
  };

  // Update the return statement to show skeleton while loading
  if (isLoading || !applications_by_status) {
    return <KanbanSkeleton />;
  }
  // If no data is found
  if (Object.keys(applications_by_status).length === 0 || Object.keys(status_counts).length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-full mt-10">
        <h2 className="text-xl text-gray-500 pb-2">Data Not Found</h2>
        <Button
          variant="outline"
          className={styles.filtersButton}
          onClick={() =>
            dispatch(fetchKanbanData())
          }
        >
          Revert Data
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={styles.header}>Kanban board</h1>
        <Button
          variant="outline"
          className={styles.filtersButton}
          onClick={() =>
            dispatch(
              filterKanbanData({
                priority: "medium",
                payment_status: "paid",
                start_date: "1996-08-09",
                end_date: "1996-08-09",
                application_id: 87778,
              })
            )
          }
        >
          Filters
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.boardContainer}>
          {Object.values(columns).map((column) => (
            <div key={column.id} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span>
                    {column.title}({column.count})
                  </span>
                </div>
                {/* <Button variant="ghost" className={styles.addButton}> */}
                <AddButton className="cursor-pointer h-[32px] w-[32px]" />
                {/* </Button> */}
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${styles.taskList} ${
                      snapshot.isDraggingOver ? styles.draggingOver : ""
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${styles.task} ${
                              snapshot.isDragging ? styles.dragging : ""
                            }`}
                          >
                            <div className={styles.taskHeader}>
                              <div className="flex items-center gap-2">
                                <IndiaFlag className="w-5 h-5" />
                                <span className={styles.country}>India</span>
                              </div>
                              <MoreVerticalSvg className="cursor-pointer" />
                            </div>
                            <h3
                              className={
                                column.title !== "Rejected"
                                  ? styles.taskTitle
                                  : styles.rejectedTitle
                              }
                            >
                              {task.title}
                            </h3>
                            <div className={styles.taskInfo}>
                              <span>
                                ID:{" "}
                                <span className="text-[#24282E]">
                                  {task.applicationId}
                                </span>
                              </span>
                              <div className={styles.dates}>
                                <div className="flex gap-1 items-center">
                                  <CalendarSvg />
                                  <span className={styles.dateText}>
                                    {task.applicationDate}
                                  </span>
                                </div>
                                <div className="flex gap-1 items-center">
                                  <FlightSvg />
                                  <span className={styles.dateText}>
                                    {task.applicationDate}
                                  </span>
                                </div>
                                {/* <span>{task.flightDate}</span> */}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
