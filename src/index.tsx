import React, { useState, useRef, useContext, useEffect, useCallback, useMemo } from 'react';
import { useInstanceVar } from './utils/hooks';

interface UseDraggableProps {
  dropTargetId: number | string;
}

interface DraggableAreaProps {
  items: JSX.Element[];
  children?: JSX.Element | JSX.Element[];
  [key: string]: any;
}

interface DropTargetProps {
  uid: number | string;
  disabled?: boolean;
  children?: JSX.Element | JSX.Element[];
  [key: string]: any;
}

interface DropTargetContextValue {
  draggableItems?: JSX.Element[];
  handleDrop?: (e: React.MouseEvent, dropTargetId: number | string) => void;
}

interface DraggableContextValue {
  activeDraggableId?: number | string | null;
  activeDraggableCoors?: readonly [number, number] | null;
  handleDragStart?: (e: React.MouseEvent, id: number | string) => void;
}

const DropTargetContext = React.createContext<DropTargetContextValue>({});
const DraggableContext = React.createContext<DraggableContextValue>({});

export function DraggableArea(props: DraggableAreaProps) {
  const [getAnimationHandle, setAnimationHandle] = useInstanceVar<number | null>(null);
  const [getActiveItemCoors, setActiveItemCoors] =
    useInstanceVar<readonly [number, number]>([0, 0]);

  const [activeDraggableId, setActiveDraggableId] = useState<number | string | null>(null);
  const [activeDraggableCoors, setActiveDraggableCoors] =
    useState<readonly [number, number] | null>(null);

  useEffect(() => {
    const cleanup = () => {
      const handle = getAnimationHandle();

      if (handle !== null) {
        // An animation loop is still running.
        cancelAnimationFrame(handle);
        setAnimationHandle(null);
      }
    };

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragStart = useCallback(
    (e: React.MouseEvent, id: number | string) => {
      e.preventDefault();

      if (activeDraggableId === null) {
        setActiveItemCoors([e.clientX, e.clientY]);

        const updateActiveItem = () => {
          const handle = requestAnimationFrame(updateActiveItem);
          setAnimationHandle(handle);

          const coors = getActiveItemCoors();
          setActiveDraggableId(id);
          setActiveDraggableCoors(coors);
        };

        requestAnimationFrame(updateActiveItem);
      }
    },
    [activeDraggableId, getActiveItemCoors, setActiveItemCoors, setAnimationHandle],
  );

  const handleDragMove = (e: React.MouseEvent) => {
    e.preventDefault();

    if (activeDraggableId !== null) {

      setActiveItemCoors([e.clientX, e.clientY]);
    }
  };

  const handleDragStop = (e: React.MouseEvent) => {
    e.preventDefault();

    setActiveItemCoors([0, 0]);
    setActiveDraggableId(null);

    const handle = getAnimationHandle();

    if (handle !== null) {
      cancelAnimationFrame(handle);
      setAnimationHandle(null);
    }
  };

  const handleDrop = useCallback(
    (e: React.MouseEvent, dropTargetId: number | string) => {
      e.preventDefault();

      if (activeDraggableId !== null) {
        const draggableItem = props.items.find(item => item.props.dropTarget === activeDraggableId);
        draggableItem?.props.onDrop(dropTargetId);
      }
    },
    [activeDraggableId, props.items],
  );

  const dropTargetContextValue = useMemo(() => (
    {
      draggableItems: props.items,
      handleDrop,
    }
  ), [props.items, handleDrop]);


  const draggableContextValue = useMemo(() => (
    {
      activeDraggableId,
      activeDraggableCoors,
      handleDragStart,
    }
  ), [activeDraggableId, activeDraggableCoors, handleDragStart]);

  return (
    <DropTargetContext.Provider value={dropTargetContextValue}>
      <DraggableContext.Provider value={draggableContextValue}>
        <div
          {...props}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragStop}
        >
          {props.children}
        </div>
      </DraggableContext.Provider>
    </DropTargetContext.Provider>
  );
}

export function DropTarget({ uid, disabled, children, ...props }: DropTargetProps) {
  const { draggableItems, handleDrop } = useContext(DropTargetContext);
  const draggableItem = draggableItems?.find(item => item.props.dropTarget === uid);

  const onMouseUp = !disabled && !draggableItem
    ? (e: React.MouseEvent) => handleDrop?.(e, uid)
    : undefined;

  return (
    <div
      {...props}
      onMouseUp={onMouseUp}
    >
      {draggableItem}
      {children}
    </div>
  );
}

export function useDropMap(defaultValue?: { [key in number | string]: number | string }) {
  const [state, setState] = useState(defaultValue ?? {});

  const setDropMapValue = (prop: number | string, id: number | string) => {
    setState(prevState => (
      { ...prevState, [prop]: id }
    ));
  };

  return [state, setDropMapValue] as const;
}

export function useDraggable({ dropTargetId }: UseDraggableProps) {
  const ref = useRef<HTMLElement>(null);
  const { activeDraggableId, activeDraggableCoors, handleDragStart } = useContext(DraggableContext);

  const isActive = dropTargetId === activeDraggableId;
  let [x, y] = [0, 0];

  if (isActive && activeDraggableCoors && ref.current) {
    [x, y] = activeDraggableCoors;
    x = x - ref.current.offsetLeft - (ref.current.offsetWidth / 2);
    y = y - ref.current.offsetTop - (ref.current.offsetHeight / 2);
  }

  const style = {
    transform: `translate3d(${x}px, ${y}px, 0.1px)`,
    pointerEvents: isActive ? 'none' as const : 'auto' as const,
    zIndex: isActive ? 9999 : 'auto' as const,
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Is left click.
      handleDragStart?.(e, dropTargetId);
    }
  };

  return {
    ref,
    isActive,
    style,
    onMouseDown,
  };
}
