import React, { useState } from 'react';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import EditBlockModal from '../components/Calendar/EditBlockModal';

const Week = ({ 
  blocksByDay = {}, 
  getDayBlocks,
  todayBlocks = [], 
  projects = [],
  onToggleCheckBlock, 
  onNewTask, 
  onSaveBlock, 
  onDeleteBlock,
  onAddBlockToDay
}) => {
  const [editingBlockData, setEditingBlockData] = useState(null); // { block, dayIndex, isoDate }
  
  // Calendar view mode: '1day' | '3days' | 'week'
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('pos_calendar_view');
    if (saved) return saved;
    return typeof window !== 'undefined' && window.innerWidth < 768 ? '1day' : 'week';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('pos_calendar_view', mode);
  };

  const handleEditBlock = (block, dayIndex, isoDate) => {
    setEditingBlockData({ block, dayIndex, isoDate: isoDate || block.date });
  };

  const handleNewTaskAtSlot = (dayIndex, startTime, isoDate) => {
    if (onAddBlockToDay) {
      onAddBlockToDay(dayIndex, startTime, isoDate);
    } else if (onNewTask) {
      onNewTask();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden animate-in fade-in duration-200">
      
      {/* Desktop Calendar View (1 Day, 3 Days, or Full 7 Days) */}
      <WeekView 
        blocksByDay={blocksByDay} 
        getDayBlocks={getDayBlocks}
        projects={projects}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onToggleCheck={onToggleCheckBlock} 
        onEditBlock={handleEditBlock}
        onNewTaskAtSlot={handleNewTaskAtSlot}
        onNewTask={onNewTask}
        onSaveBlock={onSaveBlock}
      />
      
      {/* Mobile Calendar View (1 Day, 3 Days, or 7 Days with scroll) */}
      <DayView 
        blocksByDay={blocksByDay}
        getDayBlocks={getDayBlocks}
        todayBlocks={todayBlocks} 
        projects={projects}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onToggleCheck={onToggleCheckBlock} 
        onNewTask={onNewTask} 
        onEditBlock={handleEditBlock}
        onNewTaskAtSlot={handleNewTaskAtSlot}
        onSaveBlock={onSaveBlock}
      />

      {/* Edit Block Modal */}
      {editingBlockData && (
        <EditBlockModal
          isOpen={!!editingBlockData}
          onClose={() => setEditingBlockData(null)}
          block={editingBlockData.block}
          dayIndex={editingBlockData.dayIndex}
          isoDate={editingBlockData.isoDate}
          onSaveBlock={onSaveBlock}
          onDeleteBlock={onDeleteBlock}
        />
      )}

    </div>
  );
};

export default Week;
