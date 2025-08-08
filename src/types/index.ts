export interface ResumeAnalysis {
  name: string;
  strict: boolean;
  schema: {
    type: string;
    properties: {
      schema_version: string;
      generated_at: string;
      inputs: {
        resume_text_hash: string | null;
        file_format: 'pdf' | 'docx' | 'txt' | null;
        target_title: string | null;
        job_descriptions: Array<{
          title: string;
          company: string | null;
          description: string;
        }>;
        keyword_source: 'provided' | 'inferred';
        industry_keywords_considered: string[];
        inference_notes: string | null;
      };
      scores: {
        keyword_coverage: number;
        ats_compliance: number;
        job_match: number;
        organization_structure: number;
        ats_ranking: number;
        readability: number;
        ghosted_risk_subscore_0_to_10: number;
      };
      breakdown: {
        keyword_coverage: {
          score: number;
          keywords_found_count: number;
          keywords_found: string[];
          missing_keywords: string[];
          hackedcv_auto_10_applied: boolean;
          rationale: string | null;
          evidence: string[];
        };
        organization_structure: {
          score: number;
          checks: {
            summary_present: boolean;
            bullet_alignment_consistent: boolean;
            headers_bold_clean: boolean;
            spacing_consistent: boolean;
            reverse_chronological: boolean;
          };
          rationale: string | null;
          evidence: string[];
        };
        ats_compliance: {
          score: number;
          violations_count: number;
          violations: Array<'non_acceptable_format' | 'text_boxes_or_tables_detected' | 'columns_detected' | 'backend_xml_keywords_missing' | 'non_symbol_bullets' | 'hidden_headers_or_footers'>;
          backend_keyword_injection_detected: boolean;
          rationale: string | null;
        };
        readability: {
          score: number;
          avg_bullet_line_length_lt_2: boolean | null;
          metrics_examples_count: number;
          action_verbs_examples_count: number;
          buzzword_stuffing_detected: boolean;
          rationale: string | null;
          evidence: string[];
        };
        job_match: {
          score: number;
          alignment_factors: {
            target_role_in_summary_or_title: boolean;
            jd_keyword_alignment: boolean;
            industry_match_in_history: boolean;
            transferable_skills: boolean;
          };
          rationale: string | null;
          evidence: string[];
        };
        ats_ranking: {
          score: number;
          label: 'Low' | 'Medium' | 'High';
          rationale: string | null;
        };
        ghosted_risk: {
          percent: number;
          components: {
            strong_summary: boolean;
            job_title_top_third: boolean;
            formatting_metrics_visible: boolean;
            high_keyword_density: boolean;
          };
          rationale: string | null;
        };
      };
      flags: {
        cold_traffic_floor_applied: boolean;
        hackedcv_detected: boolean;
      };
      overall: {
        score_0_to_100: number;
        weights_applied: {
          keyword_coverage: 0.2;
          ats_compliance: 0.2;
          job_match: 0.15;
          organization_structure: 0.15;
          ats_ranking: 0.15;
          readability: 0.1;
          ghosted_risk: 0.05;
        };
        cold_traffic_cap_applied: boolean;
        final_label: 'Low' | 'Medium' | 'High';
        rationale: string | null;
      };
      recommendations: Array<{
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
      }>;
      what_this_means: string | null;
      debug: {
        per_rule_points: {
          Placeholder1: string;
        };
        notes: string | null;
      };
    };
  };
}

// Simplified interface for the actual response data we'll work with
export interface ResumeAnalysisData {
  schema_version: string;
  generated_at: string;
  inputs: {
    resume_text_hash: string | null;
    file_format: 'pdf' | 'docx' | 'txt' | null;
    target_title: string | null;
    job_descriptions: Array<{
      title: string;
      company: string | null;
      description: string;
    }>;
    keyword_source: 'provided' | 'inferred';
    industry_keywords_considered: string[];
    inference_notes: string | null;
  };
  scores: {
    keyword_coverage: number;
    ats_compliance: number;
    job_match: number;
    organization_structure: number;
    ats_ranking: number;
    readability: number;
    ghosted_risk_subscore_0_to_10: number;
  };
  breakdown: {
    keyword_coverage: {
      score: number;
      keywords_found_count: number;
      keywords_found: string[];
      missing_keywords: string[];
      hackedcv_auto_10_applied: boolean;
      rationale: string | null;
      evidence: string[];
    };
    organization_structure: {
      score: number;
      checks: {
        summary_present: boolean;
        bullet_alignment_consistent: boolean;
        headers_bold_clean: boolean;
        spacing_consistent: boolean;
        reverse_chronological: boolean;
      };
      rationale: string | null;
      evidence: string[];
    };
    ats_compliance: {
      score: number;
      violations_count: number;
      violations: Array<'non_acceptable_format' | 'text_boxes_or_tables_detected' | 'columns_detected' | 'backend_xml_keywords_missing' | 'non_symbol_bullets' | 'hidden_headers_or_footers'>;
      backend_keyword_injection_detected: boolean;
      rationale: string | null;
    };
    readability: {
      score: number;
      avg_bullet_line_length_lt_2: boolean | null;
      metrics_examples_count: number;
      action_verbs_examples_count: number;
      buzzword_stuffing_detected: boolean;
      rationale: string | null;
      evidence: string[];
    };
    job_match: {
      score: number;
      alignment_factors: {
        target_role_in_summary_or_title: boolean;
        jd_keyword_alignment: boolean;
        industry_match_in_history: boolean;
        transferable_skills: boolean;
      };
      rationale: string | null;
      evidence: string[];
    };
    ats_ranking: {
      score: number;
      label: 'Low' | 'Medium' | 'High';
      rationale: string | null;
    };
    ghosted_risk: {
      percent: number;
      components: {
        strong_summary: boolean;
        job_title_top_third: boolean;
        formatting_metrics_visible: boolean;
        high_keyword_density: boolean;
      };
      rationale: string | null;
    };
  };
  flags: {
    cold_traffic_floor_applied: boolean;
    hackedcv_detected: boolean;
  };
  overall: {
    score_0_to_100: number;
    weights_applied: {
      keyword_coverage: 0.2;
      ats_compliance: 0.2;
      job_match: 0.15;
      organization_structure: 0.15;
      ats_ranking: 0.15;
      readability: 0.1;
      ghosted_risk: 0.05;
    };
    cold_traffic_cap_applied: boolean;
    final_label: 'Low' | 'Medium' | 'High';
    rationale: string | null;
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  what_this_means: string | null;
  debug: {
    per_rule_points: {
      Placeholder1: string;
    };
    notes: string | null;
  };
}

export interface ApiResponse {
  success: boolean;
  data?: ResumeAnalysisData;
  error?: string;
  message?: string;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UploadResponse {
  success: boolean;
  analysis?: ResumeAnalysisData;
  error?: string;
  validationErrors?: ValidationError[];
}

export type FileType = 'pdf' | 'docx' | 'doc';

export interface FileValidation {
  isValid: boolean;
  errors: string[];
  fileType?: FileType;
  fileSize?: number;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingSpinnerProps extends ComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface FileUploaderProps extends ComponentProps {
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  acceptedTypes: string[];
  maxSize: number;
}

export interface ResultsDisplayProps extends ComponentProps {
  analysis: ResumeAnalysisData;
  onReset: () => void;
}

export interface HeaderProps extends ComponentProps {
  title: string;
  subtitle?: string;
}