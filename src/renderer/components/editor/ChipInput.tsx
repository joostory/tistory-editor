import React, { useEffect, useState } from 'react'
import { Box, Chip, TextField } from '@mui/material'
import update from 'immutability-helper'

interface ChipInputTextFieldProps {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
}

function ChipInputTextField({ label, placeholder, onAdd }: ChipInputTextFieldProps) {
  function handleAdd(e: any) {
    onAdd(e.target.value.trim())
    e.target.value = ''
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if ([9, 13, 188].find(v => v === e.keyCode)) {
      e.preventDefault()
      handleAdd(e)
      return
    }
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    handleAdd(e)
  }

  return (
    <TextField
      label={label} 
      placeholder={placeholder}
      fullWidth
      variant="outlined"
      size="medium"
      helperText="엔터(Enter), 쉼표(,), 혹은 입력 창 밖을 누르면 태그가 추가됩니다."
      onKeyDown={handleInputKeyDown}
      onBlur={handleInputBlur}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2.5,
        },
        '& .MuiFormHelperText-root': {
          mt: 1,
          color: 'text.secondary',
          fontSize: '0.75rem'
        }
      }}
    />
  )
}

interface ChipInputProps {
  label: string;
  placeholder: string;
  defaultValue?: string[];
  onChange: (chips: string[]) => void;
}

export default function ChipInput({ label, placeholder, defaultValue, onChange }: ChipInputProps) {
  const [chips, setChips] = useState<string[]>(defaultValue || [])

  function handleAdd(value: string) {
    if (value === '' || chips.includes(value)) {
      return
    }

    setChips(update(chips, {
      $push: [value]
    }))
  }

  function handleDelete(value: string) {
    const index = chips.findIndex(chip => chip === value)
    if (index !== -1) {
      setChips(update(chips, {
        $splice: [[index, 1]]
      }))
    }
  }

  useEffect(() => {
    onChange(chips)
  }, [chips])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ChipInputTextField
        label={label} 
        placeholder={placeholder}
        onAdd={handleAdd}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {chips.map(value =>
          <Chip
            key={value}
            label={`# ${value}`}
            size="medium"
            onDelete={() => handleDelete(value)}
            sx={{
              backgroundColor: '#f1f3f5',
              color: '#495057',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '0.85rem',
              border: 'none',
              '& .MuiChip-deleteIcon': {
                color: '#adb5bd',
                '&:hover': {
                  color: '#868e96'
                }
              },
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#e9ecef',
                transform: 'translateY(-1px)'
              }
            }}
          />
        )}
      </Box>
    </Box>
  )
}
