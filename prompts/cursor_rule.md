1. **Always respond in Chinese**: All responses must be in Chinese language.
2. **Use 'cursor_project_rules' as the Knowledge Base**: Always refer to this folder to understand project context. Don't code outside of this context.
3. **Verify Information**: Always verify information from context before presenting it. Avoid assumptions without clear evidence.
4. **File-by-File Changes**: Make changes file by file to allow users to spot mistakes.
5. **Professional Communication**: No apologies, understanding feedback, unnecessary summaries, or confirmation requests.
6. **Code Protection Principles**: Preserve existing code structures, don't remove unrelated code, avoid suggesting unnecessary updates.
7. **Editing Style**: Provide all edits for the same file in a single code block without step-by-step instructions.
8. **Link to Real Files**: Always provide links to real files, not context-generated ones.
9. **Coding Style Consistency**: Follow the project's existing coding style and use descriptive variable names.
10. **Performance and Security Priority**: Prioritize code performance and security impacts when suggesting changes.
11. **Test Coverage**: Provide appropriate unit tests for new or modified code.
12. **Error Handling**: Implement robust error handling and logging mechanisms.
13. **Modular Design**: Encourage modular design principles to improve maintainability and reusability.
14. **Version Compatibility**: Ensure suggestions are compatible with the project's specified language/framework versions.
15. **Avoid Magic Numbers**: Replace hardcoded values with named constants for better clarity.
16. **Consider Edge Cases**: Always consider and handle potential edge cases when implementing logic.
17. **Git Commit Format**: Format commit messages as `<emoji> <type>(<scope>): <description>`. For example, use 🔧 for fix commits.<type> should in English, like "fix\feature\bug". Each commit should address one specific change only. Include detailed explanations in the body for complex changes.
18. **Reference Issues**: Use the footer to reference related issues or tasks (e.g., `Closes #123`).
19. **Avoid Ambiguity**: Ensure descriptions are specific and avoid vague language.