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

  // FocusEvent를 통해 blur 시 태그 추가 처리
  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    handleAdd(e)
  }

  return (
    <TextField
      label={label} placeholder={placeholder}
      fullWidth
      onKeyDown={handleInputKeyDown}
      onBlur={handleInputBlur}
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
    if (value === '') {
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
    <>
      <ChipInputTextField
        label={label} placeholder={placeholder}
        onAdd={handleAdd}
      />

      <Box>
        {chips.map(value =>
          <Chip
            key={value}
            label={value}
            sx={{ margin: (theme: any) => theme.spacing(1/2) }}
            onDelete={() => handleDelete(value)}
          />
        )}
      </Box>
      
    </>
  )
}
