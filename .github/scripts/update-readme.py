#!/usr/bin/env python3

from dataclasses import dataclass, field
from typing import Any, List, Callable, TypeVar
import io
import os
import yaml
from pytablewriter import MarkdownTableWriter

T = TypeVar("T")


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


@dataclass
class GitHubAction:
    name: str
    description: str = ''


@dataclass
class ActionInput(GitHubAction):
    required: bool = False
    default: str = ''


@dataclass
class ActionOutput(GitHubAction):
    pass


@dataclass
class ActionInputs:
    required: List[ActionInput] = field(default_factory=list)
    optional: List[ActionInput] = field(default_factory=list)

    def add(self, name: str, description: str = '', required: bool = False, default_value: str = ''):
        action_input = ActionInput(name, description, required, default_value)
        if required:
            self.required.append(action_input)
        else:
            self.optional.append(action_input)

    def to_value_matrix(self) -> List[List[Any]]:
        return self.__to_list(self.required) + self.__to_list(self.optional)

    @staticmethod
    def __to_list(action_inputs: List[ActionInput]) -> List[List[Any]]:
        return [[ai.name, ai.description, ai.required, ai.default] for ai in action_inputs]


@dataclass
class ActionOutputs:
    outputs: List[ActionOutput] = field(default_factory=list)

    def add(self, name: str, description: str = ''):
        self.outputs.append(ActionOutput(name, description))

    def to_value_matrix(self) -> List[List[str]]:
        return [[ao.name, ao.description] for ao in self.outputs]


class MarkdownTableGenerator:
    @staticmethod
    def generate(action_result, headers: List[str]) -> List[str]:
        writer = MarkdownTableWriter(
            headers=headers,
            value_matrix=action_result.to_value_matrix(),
            margin=1,
            flavor="github",
            enable_ansi_escape=False,
        )
        output_buffer = io.StringIO()
        writer.stream = output_buffer
        writer.write_table()
        return output_buffer.getvalue().splitlines()


class YAMLParser:
    @staticmethod
    def parse(file_path: str) -> dict:
        with open(file_path, 'r') as file:
            return yaml.safe_load(file)


class ReadmeUpdater:
    def __init__(self, yaml_file: str, md_file: str,
                 start_marker: str = "<!-- BEGINNING OF TEMPLATE -->",
                 end_marker: str = "<!-- END OF TEMPLATE -->"):
        self.yaml_file = yaml_file
        self.md_file = md_file
        self.start_marker = start_marker
        self.end_marker = end_marker

    def update(self):
        data = YAMLParser.parse(self.yaml_file)
        md_content = self.__generate_markdown_content(data)
        self.__update_readme(md_content)

    def __generate_markdown_content(self, data: dict) -> List[str]:
        md_content = ['\n### Inputs\n']
        md_content += MarkdownTableGenerator.generate(
            self.__build_action_inputs(data), ["Name", "Description", "Required", "Default"]
        )
        md_content.append('\n### Outputs\n')
        md_content += MarkdownTableGenerator.generate(
            self.__build_action_outputs(data), ["Name", "Description"]
        )
        return md_content

    @staticmethod
    def __build_action_inputs(data: dict) -> ActionInputs:
        action_inputs = ActionInputs()
        for key, values in sorted(data.get('inputs', {}).items()):
            action_inputs.add(key, values.get('description', ''), values.get('required', False),
                              values.get('default', ''))
        return action_inputs

    @staticmethod
    def __build_action_outputs(data: dict) -> ActionOutputs:
        action_outputs = ActionOutputs()
        for key, values in sorted(data.get('outputs', {}).items()):
            action_outputs.add(key, values.get('description', ''))
        return action_outputs

    @staticmethod
    def __create_readme_with_template_if_not_exists(file_path: str, content: list[str]) -> None:
        if not os.path.exists(file_path):
            with open(file_path, "w", encoding='utf-8') as file:
                content = file.write(''.join(content))

    def __update_readme(self, md_content: List[str]):
        self.__create_readme_with_template_if_not_exists(self.md_file, [self.start_marker, '\n', self.end_marker])
        with open(self.md_file, "r", encoding='utf-8') as file:
            content = file.read()

        new_content = self.__replace_markdown_section(content, md_content, self.start_marker, self.end_marker)

        with open(self.md_file, "w") as file:
            file.write(new_content)

        print(f'{self.md_file} file has been updated.')

    @staticmethod
    def __replace_markdown_section(content: str, md_content: List[str], start_marker: str, end_marker: str) -> str:
        start_index = content.find(start_marker)
        end_index = content.find(end_marker, start_index)
        if start_index != -1 and end_index != -1:
            before = content[:start_index + len(start_marker)]
            after = content[end_index:]
            return before + '\n'.join(md_content) + '\n' + after
        else:
            return content + '\n'.join(md_content) + '\n'


def main() -> None:
    readme_updater = ReadmeUpdater('action.yaml', 'README.md')
    readme_updater.update()


if __name__ == '__main__':
    main()
