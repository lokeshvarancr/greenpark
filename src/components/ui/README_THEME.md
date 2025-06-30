# Theme & Layout Example

## Tailwind Theme Override

- All primary colors use Tailwind's blue palette (blue-500 to blue-900) via CSS variables in `src/theme.css`.
- `tailwind.config.js` is set to use these CSS variables for `primary`, `background`, `card`, etc.
- Supports light/dark mode with `.dark` class on `<html>`.

## Example Usage

### Card
```tsx
<Card className="max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Blue Themed Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-blue-700 dark:text-blue-300">This card uses the global blue theme.</p>
  </CardContent>
  <CardFooter>
    <Button>Primary Action</Button>
    <Button variant="secondary" className="ml-2">Secondary</Button>
  </CardFooter>
</Card>
```

### Badge
```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Theme Toggle
```tsx
<ThemeToggle />
```

### Layout
```tsx
<AppLayout>
  {/* page content */}
</AppLayout>
```

---
- See `src/theme.css` and `tailwind.config.js` for how the theme is set up.
- All components use the blue theme by default.
