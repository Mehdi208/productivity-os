import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import EditBlockModal from '../components/Calendar/EditBlockModal';
import ChallengeRdvDetailsModal from '../components/Calendar/ChallengeRdvDetailsModal';

const Week = ({ 
  blocksByDay = {}, 
  getDayBlocks,
  todayBlocks = [], 
  projects = [],
  dailyRoutines = [],
  onToggleCheckBlock, 
  onNewTask, 
  onSaveBlock, 
  onDeleteBlock,
  onAddBlockToDay,
  onUpdateRdvStatus,
  onUpdateRdvDetails,
  onDeleteRdv
}) => {
  const navigate = useNavigate();
  const [editingBlockData, setEditingBlockData] = useState(null); // { block, dayIndex, isoDate }
  const [selectedRdvBlock, setSelectedRdvBlock] = useState(null);
  
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
    if (block?.isChallengeRdv) {
      setSelectedRdvBlock(block);
    } else {
      setEditingBlockData({ block, dayIndex, isoDate: isoDate || block.date });
    }
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
          getDayBlocks={getDayBlocks}
          dailyRoutines={dailyRoutines}
        />
      )}

      {/* Challenge 30 Jours Dedicated RDV Modal */}
      {selectedRdvBlock && (
        <ChallengeRdvDetailsModal
          isOpen={!!selectedRdvBlock}
          onClose={() => setSelectedRdvBlock(null)}
          block={selectedRdvBlock}
          onUpdateRdvStatus={(blockId, newStatus) => {
            if (onUpdateRdvStatus) {
              onUpdateRdvStatus(blockId, newStatus);
            }
            setSelectedRdvBlock(prev => prev && prev.id === blockId ? {
              ...prev,
              checked: newStatus === 'completed',
              rdvDetails: { ...prev.rdvDetails, status: newStatus }
            } : prev);
          }}
          onUpdateRdvDetails={(blockId, details) => {
            if (onUpdateRdvDetails) {
              onUpdateRdvDetails(blockId, details);
            }
            setSelectedRdvBlock(null);
          }}
          onDeleteRdv={(blockId, date) => {
            if (onDeleteRdv) {
              onDeleteRdv(blockId, date);
            }
            setSelectedRdvBlock(null);
          }}
          onNavigateToChallenge={() => navigate('/challenge')}
        />
      )}

    </div>
  );
};

export default Week;
