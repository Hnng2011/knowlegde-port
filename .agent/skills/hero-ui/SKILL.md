# Skill: HeroUI v3 Development

## Description

Must be used for all UI development tasks involving HeroUI v3. This skill ensures the agent follows the mandatory Dot Notation anatomy, utilizes the correct sub-components (Backdrop, Container, Dialog), and adheres to the latest React Aria-based patterns.

## Core Rules

1. **Dot Notation Mandatory:** Always use the component's sub-components via dot notation (e.g., `<Modal.Header>` instead of `<ModalHeader>`).
2. **Standard Anatomy:**
   - **Modal:** `Modal` > `Modal.Backdrop` > `Modal.Container` > `Modal.Dialog` > (`Modal.Header`, `Modal.Body`, `Modal.Footer`).
   - **Dropdown:** `Dropdown` > `Dropdown.Trigger` > `Dropdown.Popover` > `Dropdown.Menu` > `Dropdown.Item`.
3. **Correct Component Names:** Use `Navbar`, `Modal`, `Dropdown` directly from `@heroui/react`. Do NOT use old prefixes like `HeroNavbar` or `NextModal`.
4. **State Management:** Use the `useOverlayState` hook for controlled overlay components.
5. **Form Integration:** Use the `<Form>` component with `validationBehavior="native"` for consistent validation.

## Component Patterns

### Modal Anatomy

```tsx
<Modal>
  <Button>Open</Button>
  <Modal.Backdrop variant="blur">
    <Modal.Container size="md">
      <Modal.Dialog>
        <Modal.CloseTrigger />
        <Modal.Header>
          <Modal.Icon>
            <IconComponent />
          </Modal.Icon>
          <Modal.Heading>Title</Modal.Heading>
        </Modal.Header>
        <Modal.Body>Content</Modal.Body>
        <Modal.Footer>
          <Button slot="close">Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </Modal.Container>
  </Modal.Backdrop>
</Modal>
```

### Dropdown Anatomy

```tsx
<Dropdown>
  <Dropdown.Trigger>
    <Button>Open</Button>
  </Dropdown.Trigger>
  <Dropdown.Popover>
    <Dropdown.Menu onAction={(key) => handleAction(key)}>
      <Dropdown.Item id="action" textValue="Action">
        <Label>Action Label</Label>
        <Description>Description text</Description>
        <Kbd slot="keyboard">⌘A</Kbd>
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown.Popover>
</Dropdown>
```

## Styling Guidelines

1. **Tailwind v4:** Use standard Tailwind utility classes. Prefer `@theme` variables.
2. **No Purple:** Strictly avoid any purple color variants in UI components. Use blue, zinc, or neutral instead.
3. **Smart Aesthetics:** Maintain high visual hierarchy. Use `<Label>` for primary text and `<Description>` for secondary text within collection items.
4. **GSAP Integration:** When using GSAP with HeroUI components, always use useGSAP and target the ref of the underlying element or the component's className.

## References

1. **Components Docs:** https://v3.heroui.com/docs/react/components/
2. **Layout/Icons:** Use Gravity UI icons or Lucide where applicable.
