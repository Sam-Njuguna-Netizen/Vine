'use client';
import { Button} from 'antd';

export default function ButtonSuccess({children, onClick}) {
  return (
    <Button onClick={onClick} style={{ backgroundColor: '#19BE6B', color: 'white' }}> {children} </Button>
  );
}
