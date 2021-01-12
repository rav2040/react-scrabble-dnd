import React from 'react';
import ReactDOM from 'react-dom';
import { DraggableArea, DropTarget, useDraggable, useDropMap } from '../src';

interface MyDraggableProps {
  dropTarget: number | string;
  disabled?: boolean;
  onDrop: (id: number | string) => void;
}

function MyDraggable({ dropTarget, disabled }: MyDraggableProps) {
  const draggable = useDraggable({ dropTargetId: dropTarget });

  const onMouseDown = (e: React.MouseEvent) => {
    !disabled && draggable.onMouseDown(e);
  };

  return (
    <div
      ref={draggable.ref as React.RefObject<HTMLDivElement>}
      style={{
        ...draggable.style,
        position: 'absolute',
        width: '50px',
        height: '50px',
        backgroundColor: '#648bc5',
        border: '2px solid #265aa8' ,
        boxSizing: 'border-box',
      }}
      onMouseDown={onMouseDown}
    />
  );
}

function MyDropTarget({ uid }: { uid: number | string }) {
  return (
    <DropTarget
      uid={uid}
      style={{
        width: '50px',
        height: '50px',
        margin: '1px',
        backgroundColor: '#ccc',
      }}
    />
  );
}

function App() {
  const [dropMap, setDropMapValue] = useDropMap({
    0: '00',
    1: '01',
    2: '02',
    3: '03',
    4: '04',
    5: '05',
    6: '06',
  });

  const draggableItems = [
    <MyDraggable dropTarget={dropMap[0]} onDrop={setDropMapValue.bind(null, 0)} />,
    <MyDraggable dropTarget={dropMap[1]} onDrop={setDropMapValue.bind(null, 1)} />,
    <MyDraggable dropTarget={dropMap[2]} onDrop={setDropMapValue.bind(null, 2)} />,
    <MyDraggable dropTarget={dropMap[3]} onDrop={setDropMapValue.bind(null, 3)} />,
    <MyDraggable dropTarget={dropMap[4]} onDrop={setDropMapValue.bind(null, 4)} />,
    <MyDraggable dropTarget={dropMap[5]} onDrop={setDropMapValue.bind(null, 5)} />,
    <MyDraggable dropTarget={dropMap[6]} onDrop={setDropMapValue.bind(null, 6)} />,
  ];

  const targets: any[] = [];

  for (let i = 0; i < 15; i++) {
    const row: any[] = [];

    for (let j = 0; j < 15; j++) {
      const target = <MyDropTarget key={j} uid={'' + i + j} />;
      row.push(target);
    }

    targets.push(
      <div key={i} style={{ display: 'flex' }}>
        {row}
      </div>
    );
   }

  return (
    <DraggableArea
      items={draggableItems}
      style={{ margin: '16px' }}
    >
      <div>
        {targets}
      </div>
    </DraggableArea>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
